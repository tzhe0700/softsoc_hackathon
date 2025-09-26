/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {Timestamp} from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Admin SDK once per instance
if (!admin.apps.length) {
  admin.initializeApp();
}

const isEmulator = !!(process.env.FUNCTIONS_EMULATOR || process.env.FIREBASE_EMULATOR_HUB);
if (isEmulator && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
}

type Player = {
  id: string;
  name: string;
  joinedAt: Timestamp;
};

type Contribution = {
  playerId: string;
  sentence: string;
  order: number;
  createdAt: Timestamp;
};

type Game = {
  title: string;
  startingPrompt?: string;
  status: "waiting" | "active" | "completed" | "cancelled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  players: Player[];
  currentTurnIndex: number;
  contributions: Contribution[];
  maxPlayers?: number;
};

function allowCors(req: any, res: any) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

function badRequest(res: any, message: string) {
  res.status(400).json({ error: message });
}

export const createGame = onRequest(async (req, res) => {
  if (allowCors(req, res)) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const { title, startingPrompt, maxPlayers } = req.body ?? {};
  if (!title || typeof title !== "string") {
    badRequest(res, "title is required (string)");
    return;
  }
  if (maxPlayers !== undefined && (typeof maxPlayers !== "number" || maxPlayers < 2)) {
    badRequest(res, "maxPlayers must be a number >= 2 if provided");
    return;
  }

  const now = Timestamp.now();
  const game: Game = {
    title,
    startingPrompt,
    status: "waiting",
    createdAt: now,
    updatedAt: now,
    players: [],
    currentTurnIndex: 0,
    contributions: startingPrompt ? [{
      playerId: "system",
      sentence: startingPrompt,
      order: 0,
      createdAt: now,
    }] : [],
    // maxPlayers is set conditionally below to avoid writing undefined
  };

  if (typeof maxPlayers === "number") {
    (game as any).maxPlayers = maxPlayers;
  }

  try {
    const ref = await admin.firestore().collection("games").add(game);
    res.status(201).json({ gameId: ref.id });
  } catch (e: any) {
    logger.error("createGame failed", e);
    res.status(500).json(isEmulator ? { error: "Internal error", detail: String(e?.message ?? e), stack: e?.stack } : { error: "Internal error" });
  }
});

export const joinGame = onRequest(async (req, res) => {
  if (allowCors(req, res)) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const { gameId, playerId, name } = req.body ?? {};
  if (!gameId || typeof gameId !== "string") { badRequest(res, "gameId is required"); return; }
  if (!playerId || typeof playerId !== "string") { badRequest(res, "playerId is required"); return; }
  if (!name || typeof name !== "string") { badRequest(res, "name is required"); return; }

  const gameRef = admin.firestore().collection("games").doc(gameId);
  try {
    await admin.firestore().runTransaction(async (tx) => {
      const snap = await tx.get(gameRef);
      if (!snap.exists) throw new Error("not_found");
      const data = snap.data() as Game;
      if (data.status !== "waiting" && data.status !== "active") {
        throw new Error("game_not_joinable");
      }
      if (data.maxPlayers && data.players.length >= data.maxPlayers) {
        throw new Error("game_full");
      }
      const already = data.players.some((p) => p.id === playerId);
      if (already) return { ok: true };
      const newPlayer: Player = { id: playerId, name, joinedAt: Timestamp.now() };
      const nextStatus = data.players.length + 1 >= 2 ? "active" : data.status;
      tx.update(gameRef, {
        players: [...data.players, newPlayer],
        status: nextStatus,
        updatedAt: Timestamp.now(),
      });
      return { ok: true };
    });
    res.json({ joined: true });
  } catch (e: any) {
    if (e.message === "not_found") { res.status(404).json({ error: "Game not found" }); return; }
    if (e.message === "game_not_joinable") { res.status(409).json({ error: "Game not joinable" }); return; }
    if (e.message === "game_full") { res.status(409).json({ error: "Game is full" }); return; }
    logger.error("joinGame failed", e);
    res.status(500).json(isEmulator ? { error: "Internal error", detail: String(e?.message ?? e), stack: e?.stack } : { error: "Internal error" });
  }
});

export const submitSentence = onRequest(async (req, res) => {
  if (allowCors(req, res)) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const { gameId, playerId, sentence } = req.body ?? {};
  if (!gameId || typeof gameId !== "string") { badRequest(res, "gameId is required"); return; }
  if (!playerId || typeof playerId !== "string") { badRequest(res, "playerId is required"); return; }
  if (!sentence || typeof sentence !== "string") { badRequest(res, "sentence is required"); return; }
  const trimmed = sentence.trim();
  if (!trimmed) { badRequest(res, "sentence must not be empty"); return; }

  const gameRef = admin.firestore().collection("games").doc(gameId);
  try {
    await admin.firestore().runTransaction(async (tx) => {
      const snap = await tx.get(gameRef);
      if (!snap.exists) throw new Error("not_found");
      const data = snap.data() as Game;
      if (data.status !== "active") throw new Error("not_active");
      const playerIndex = data.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) throw new Error("not_in_game");
      if (playerIndex !== data.currentTurnIndex) throw new Error("not_player_turn");
      const order = data.contributions.length;
      const newContribution: Contribution = {
        playerId,
        sentence: trimmed,
        order,
        createdAt: Timestamp.now(),
      };
      const nextTurn = data.players.length === 0 ? 0 : (data.currentTurnIndex + 1) % data.players.length;
      tx.update(gameRef, {
        contributions: [...data.contributions, newContribution],
        currentTurnIndex: nextTurn,
        updatedAt: Timestamp.now(),
      });
    });
    res.json({ submitted: true });
  } catch (e: any) {
    const map: Record<string, { code: number; msg: string }> = {
      not_found: { code: 404, msg: "Game not found" },
      not_active: { code: 409, msg: "Game is not active" },
      not_in_game: { code: 403, msg: "Player not in game" },
      not_player_turn: { code: 409, msg: "Not this player's turn" },
    };
    const known = map[e.message];
    if (known) { res.status(known.code).json({ error: known.msg }); return; }
    logger.error("submitSentence failed", e);
    res.status(500).json(isEmulator ? { error: "Internal error", detail: String(e?.message ?? e), stack: e?.stack } : { error: "Internal error" });
  }
});

export const getGameState = onRequest(async (req, res) => {
  if (allowCors(req, res)) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const gameId = (req.query.gameId as string) ?? "";
  if (!gameId) { badRequest(res, "gameId is required"); return; }
  try {
    const snap = await admin.firestore().collection("games").doc(gameId).get();
    if (!snap.exists) { res.status(404).json({ error: "Game not found" }); return; }
    const data = snap.data() as Game;
    res.json({
      gameId: snap.id,
      title: data.title,
      status: data.status,
      players: data.players.map((p) => ({ id: p.id, name: p.name })),
      currentTurnPlayerId: data.players[data.currentTurnIndex]?.id ?? null,
      contributions: data.contributions.map((c) => ({ order: c.order, playerId: c.playerId, sentence: c.sentence })),
      startingPrompt: data.startingPrompt,
      createdAt: data.createdAt.toMillis(),
      updatedAt: data.updatedAt.toMillis(),
      maxPlayers: data.maxPlayers ?? null,
    });
  } catch (e: any) {
    logger.error("getGameState failed", e);
    res.status(500).json(isEmulator ? { error: "Internal error", detail: String(e?.message ?? e), stack: e?.stack } : { error: "Internal error" });
  }
});
