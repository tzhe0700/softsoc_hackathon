'use strict';

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory store
/** @type {Record<string, any>} */
const games = Object.create(null);

function generateShortId(len = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid confusing chars
  let id = '';
  while (id.length < len) {
    const buf = crypto.randomBytes(1)[0];
    id += alphabet[buf % alphabet.length];
  }
  return id;
}

app.post('/createGame', (req, res) => {
  const { title, startingPrompt, maxPlayers } = req.body || {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required (string)' });
  }
  if (maxPlayers !== undefined && (typeof maxPlayers !== 'number' || maxPlayers < 2)) {
    return res.status(400).json({ error: 'maxPlayers must be a number >= 2 if provided' });
  }

  // Generate a short, human-friendly game id
  let id = generateShortId(6);
  while (games[id]) id = generateShortId(6);
  const now = Date.now();
  const game = {
    id,
    title,
    startingPrompt,
    status: 'waiting',
    createdAt: now,
    updatedAt: now,
    players: [],
    currentTurnIndex: 0,
    contributions: startingPrompt ? [
      { playerName: 'System', sentence: startingPrompt, order: 0, createdAt: now },
    ] : [],
    maxPlayers: typeof maxPlayers === 'number' ? maxPlayers : undefined,
  };
  games[id] = game;
  res.status(201).json({ gameId: id });
});

app.post('/joinGame', (req, res) => {
  const { gameId, name } = req.body || {};
  if (!gameId || typeof gameId !== 'string') return res.status(400).json({ error: 'gameId is required' });
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name is required' });

  const trimmedName = name.trim();
  if (!trimmedName) return res.status(400).json({ error: 'name must not be empty' });

  const game = games[gameId];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.status !== 'waiting' && game.status !== 'active') {
    return res.status(409).json({ error: 'Game not joinable' });
  }
  if (game.maxPlayers && game.players.length >= game.maxPlayers) {
    return res.status(409).json({ error: 'Game is full' });
  }
  // Prevent duplicate names within the same game
  if (game.players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
    return res.status(409).json({ error: 'Name already taken in this game' });
  }

  game.players.push({ name: trimmedName, joinedAt: Date.now() });
  if (game.players.length >= 2) game.status = 'active';
  game.updatedAt = Date.now();
  res.json({ joined: true });
});

app.post('/submitSentence', (req, res) => {
  const { gameId, name, sentence } = req.body || {};
  if (!gameId || typeof gameId !== 'string') return res.status(400).json({ error: 'gameId is required' });
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name is required' });
  if (!sentence || typeof sentence !== 'string') return res.status(400).json({ error: 'sentence is required' });
  const trimmed = sentence.trim();
  if (!trimmed) return res.status(400).json({ error: 'sentence must not be empty' });

  const game = games[gameId];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.status !== 'active') return res.status(409).json({ error: 'Game is not active' });
  const playerIndex = game.players.findIndex(p => p.name.toLowerCase() === name.trim().toLowerCase());
  if (playerIndex === -1) return res.status(403).json({ error: 'Player not in game' });
  if (playerIndex !== game.currentTurnIndex) return res.status(409).json({ error: 'Not this player\'s turn' });

  const order = game.contributions.length;
  const playerName = game.players[playerIndex]?.name || name;
  game.contributions.push({ playerName, sentence: trimmed, order, createdAt: Date.now() });
  game.currentTurnIndex = game.players.length === 0 ? 0 : (game.currentTurnIndex + 1) % game.players.length;
  game.updatedAt = Date.now();
  res.json({ submitted: true });
});

app.get('/getGameState', (req, res) => {
  const gameId = String(req.query.gameId || '');
  if (!gameId) return res.status(400).json({ error: 'gameId is required' });
  const game = games[gameId];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  const currentTurnPlayer = game.players[game.currentTurnIndex] || null;
  res.json({
    gameId: game.id,
    title: game.title,
    status: game.status,
    players: game.players.map(p => ({ name: p.name })),
    currentTurnPlayerName: currentTurnPlayer ? currentTurnPlayer.name : null,
    contributions: game.contributions.map(c => ({ order: c.order, playerName: c.playerName || null, sentence: c.sentence })),
    startingPrompt: game.startingPrompt,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    maxPlayers: game.maxPlayers ?? null,
  });
});

app.post('/startGame', (req, res) => {
  const { gameId } = req.body || {};
  if (!gameId || typeof gameId !== 'string') return res.status(400).json({ error: 'gameId is required' });
  const game = games[gameId];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.players.length < 1) return res.status(409).json({ error: 'At least 1 player required to start' });
  game.status = 'active';
  game.updatedAt = Date.now();
  res.json({ started: true });
});

function startServer(initialPort = process.env.PORT ? Number(process.env.PORT) : 5173) {
  let port = initialPort;
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Game server listening on http://127.0.0.1:${port}`);
  });
  server.on('error', (err) => {
    if (err && (/** @type {any} */(err).code) === 'EADDRINUSE') {
      const nextPort = port + 1;
      if (nextPort <= (initialPort + 10)) {
        // eslint-disable-next-line no-console
        console.warn(`Port ${port} in use, trying ${nextPort}...`);
        setTimeout(() => startServer(nextPort), 100);
      } else {
        // eslint-disable-next-line no-console
        console.error(`No available ports in range ${initialPort}-${initialPort + 10}`);
        process.exit(1);
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    }
  });
}

startServer();


