"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameState = exports.submitSentence = exports.joinGame = exports.createGame = void 0;
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/https");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
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
(0, firebase_functions_1.setGlobalOptions)({ maxInstances: 10 });
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
function allowCors(req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return true;
    }
    return false;
}
function badRequest(res, message) {
    res.status(400).json({ error: message });
}
exports.createGame = (0, https_1.onRequest)(async (req, res) => {
    var _a, _b;
    if (allowCors(req, res))
        return;
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
    }
    const { title, startingPrompt, maxPlayers } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (!title || typeof title !== "string") {
        badRequest(res, "title is required (string)");
        return;
    }
    if (maxPlayers !== undefined && (typeof maxPlayers !== "number" || maxPlayers < 2)) {
        badRequest(res, "maxPlayers must be a number >= 2 if provided");
        return;
    }
    const now = firestore_1.Timestamp.now();
    const game = {
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
        game.maxPlayers = maxPlayers;
    }
    try {
        const ref = await admin.firestore().collection("games").add(game);
        res.status(201).json({ gameId: ref.id });
    }
    catch (e) {
        logger.error("createGame failed", e);
        res.status(500).json(isEmulator ? { error: "Internal error", detail: String((_b = e === null || e === void 0 ? void 0 : e.message) !== null && _b !== void 0 ? _b : e), stack: e === null || e === void 0 ? void 0 : e.stack } : { error: "Internal error" });
    }
});
exports.joinGame = (0, https_1.onRequest)(async (req, res) => {
    var _a, _b;
    if (allowCors(req, res))
        return;
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
    }
    const { gameId, playerId, name } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (!gameId || typeof gameId !== "string") {
        badRequest(res, "gameId is required");
        return;
    }
    if (!playerId || typeof playerId !== "string") {
        badRequest(res, "playerId is required");
        return;
    }
    if (!name || typeof name !== "string") {
        badRequest(res, "name is required");
        return;
    }
    const gameRef = admin.firestore().collection("games").doc(gameId);
    try {
        await admin.firestore().runTransaction(async (tx) => {
            const snap = await tx.get(gameRef);
            if (!snap.exists)
                throw new Error("not_found");
            const data = snap.data();
            if (data.status !== "waiting" && data.status !== "active") {
                throw new Error("game_not_joinable");
            }
            if (data.maxPlayers && data.players.length >= data.maxPlayers) {
                throw new Error("game_full");
            }
            const already = data.players.some((p) => p.id === playerId);
            if (already)
                return { ok: true };
            const newPlayer = { id: playerId, name, joinedAt: firestore_1.Timestamp.now() };
            const nextStatus = data.players.length + 1 >= 2 ? "active" : data.status;
            tx.update(gameRef, {
                players: [...data.players, newPlayer],
                status: nextStatus,
                updatedAt: firestore_1.Timestamp.now(),
            });
            return { ok: true };
        });
        res.json({ joined: true });
    }
    catch (e) {
        if (e.message === "not_found") {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        if (e.message === "game_not_joinable") {
            res.status(409).json({ error: "Game not joinable" });
            return;
        }
        if (e.message === "game_full") {
            res.status(409).json({ error: "Game is full" });
            return;
        }
        logger.error("joinGame failed", e);
        res.status(500).json(isEmulator ? { error: "Internal error", detail: String((_b = e === null || e === void 0 ? void 0 : e.message) !== null && _b !== void 0 ? _b : e), stack: e === null || e === void 0 ? void 0 : e.stack } : { error: "Internal error" });
    }
});
exports.submitSentence = (0, https_1.onRequest)(async (req, res) => {
    var _a, _b;
    if (allowCors(req, res))
        return;
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
    }
    const { gameId, playerId, sentence } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (!gameId || typeof gameId !== "string") {
        badRequest(res, "gameId is required");
        return;
    }
    if (!playerId || typeof playerId !== "string") {
        badRequest(res, "playerId is required");
        return;
    }
    if (!sentence || typeof sentence !== "string") {
        badRequest(res, "sentence is required");
        return;
    }
    const trimmed = sentence.trim();
    if (!trimmed) {
        badRequest(res, "sentence must not be empty");
        return;
    }
    const gameRef = admin.firestore().collection("games").doc(gameId);
    try {
        await admin.firestore().runTransaction(async (tx) => {
            const snap = await tx.get(gameRef);
            if (!snap.exists)
                throw new Error("not_found");
            const data = snap.data();
            if (data.status !== "active")
                throw new Error("not_active");
            const playerIndex = data.players.findIndex((p) => p.id === playerId);
            if (playerIndex === -1)
                throw new Error("not_in_game");
            if (playerIndex !== data.currentTurnIndex)
                throw new Error("not_player_turn");
            const order = data.contributions.length;
            const newContribution = {
                playerId,
                sentence: trimmed,
                order,
                createdAt: firestore_1.Timestamp.now(),
            };
            const nextTurn = data.players.length === 0 ? 0 : (data.currentTurnIndex + 1) % data.players.length;
            tx.update(gameRef, {
                contributions: [...data.contributions, newContribution],
                currentTurnIndex: nextTurn,
                updatedAt: firestore_1.Timestamp.now(),
            });
        });
        res.json({ submitted: true });
    }
    catch (e) {
        const map = {
            not_found: { code: 404, msg: "Game not found" },
            not_active: { code: 409, msg: "Game is not active" },
            not_in_game: { code: 403, msg: "Player not in game" },
            not_player_turn: { code: 409, msg: "Not this player's turn" },
        };
        const known = map[e.message];
        if (known) {
            res.status(known.code).json({ error: known.msg });
            return;
        }
        logger.error("submitSentence failed", e);
        res.status(500).json(isEmulator ? { error: "Internal error", detail: String((_b = e === null || e === void 0 ? void 0 : e.message) !== null && _b !== void 0 ? _b : e), stack: e === null || e === void 0 ? void 0 : e.stack } : { error: "Internal error" });
    }
});
exports.getGameState = (0, https_1.onRequest)(async (req, res) => {
    var _a, _b, _c, _d, _e;
    if (allowCors(req, res))
        return;
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
    }
    const gameId = (_a = req.query.gameId) !== null && _a !== void 0 ? _a : "";
    if (!gameId) {
        badRequest(res, "gameId is required");
        return;
    }
    try {
        const snap = await admin.firestore().collection("games").doc(gameId).get();
        if (!snap.exists) {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        const data = snap.data();
        res.json({
            gameId: snap.id,
            title: data.title,
            status: data.status,
            players: data.players.map((p) => ({ id: p.id, name: p.name })),
            currentTurnPlayerId: (_c = (_b = data.players[data.currentTurnIndex]) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : null,
            contributions: data.contributions.map((c) => ({ order: c.order, playerId: c.playerId, sentence: c.sentence })),
            startingPrompt: data.startingPrompt,
            createdAt: data.createdAt.toMillis(),
            updatedAt: data.updatedAt.toMillis(),
            maxPlayers: (_d = data.maxPlayers) !== null && _d !== void 0 ? _d : null,
        });
    }
    catch (e) {
        logger.error("getGameState failed", e);
        res.status(500).json(isEmulator ? { error: "Internal error", detail: String((_e = e === null || e === void 0 ? void 0 : e.message) !== null && _e !== void 0 ? _e : e), stack: e === null || e === void 0 ? void 0 : e.stack } : { error: "Internal error" });
    }
});
//# sourceMappingURL=index.js.map