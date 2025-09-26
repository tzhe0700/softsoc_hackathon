'use strict';

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory store
/** @type {Record<string, any>} */
const games = Object.create(null);

app.post('/createGame', (req, res) => {
  const { title, startingPrompt, maxPlayers } = req.body || {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required (string)' });
  }
  if (maxPlayers !== undefined && (typeof maxPlayers !== 'number' || maxPlayers < 2)) {
    return res.status(400).json({ error: 'maxPlayers must be a number >= 2 if provided' });
  }

  const id = uuidv4();
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
      { playerId: 'system', sentence: startingPrompt, order: 0, createdAt: now },
    ] : [],
    maxPlayers: typeof maxPlayers === 'number' ? maxPlayers : undefined,
  };
  games[id] = game;
  res.status(201).json({ gameId: id });
});

app.post('/joinGame', (req, res) => {
  const { gameId, playerId, name } = req.body || {};
  if (!gameId || typeof gameId !== 'string') return res.status(400).json({ error: 'gameId is required' });
  if (!playerId || typeof playerId !== 'string') return res.status(400).json({ error: 'playerId is required' });
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name is required' });

  const game = games[gameId];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.status !== 'waiting' && game.status !== 'active') {
    return res.status(409).json({ error: 'Game not joinable' });
  }
  if (game.maxPlayers && game.players.length >= game.maxPlayers) {
    return res.status(409).json({ error: 'Game is full' });
  }
  if (game.players.some(p => p.id === playerId)) return res.json({ joined: true });

  game.players.push({ id: playerId, name, joinedAt: Date.now() });
  if (game.players.length >= 2) game.status = 'active';
  game.updatedAt = Date.now();
  res.json({ joined: true });
});

app.post('/submitSentence', (req, res) => {
  const { gameId, playerId, sentence } = req.body || {};
  if (!gameId || typeof gameId !== 'string') return res.status(400).json({ error: 'gameId is required' });
  if (!playerId || typeof playerId !== 'string') return res.status(400).json({ error: 'playerId is required' });
  if (!sentence || typeof sentence !== 'string') return res.status(400).json({ error: 'sentence is required' });
  const trimmed = sentence.trim();
  if (!trimmed) return res.status(400).json({ error: 'sentence must not be empty' });

  const game = games[gameId];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.status !== 'active') return res.status(409).json({ error: 'Game is not active' });
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return res.status(403).json({ error: 'Player not in game' });
  if (playerIndex !== game.currentTurnIndex) return res.status(409).json({ error: 'Not this player\'s turn' });

  const order = game.contributions.length;
  game.contributions.push({ playerId, sentence: trimmed, order, createdAt: Date.now() });
  game.currentTurnIndex = game.players.length === 0 ? 0 : (game.currentTurnIndex + 1) % game.players.length;
  game.updatedAt = Date.now();
  res.json({ submitted: true });
});

app.get('/getGameState', (req, res) => {
  const gameId = String(req.query.gameId || '');
  if (!gameId) return res.status(400).json({ error: 'gameId is required' });
  const game = games[gameId];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json({
    gameId: game.id,
    title: game.title,
    status: game.status,
    players: game.players.map(p => ({ id: p.id, name: p.name })),
    currentTurnPlayerId: game.players[game.currentTurnIndex]?.id || null,
    contributions: game.contributions.map(c => ({ order: c.order, playerId: c.playerId, sentence: c.sentence })),
    startingPrompt: game.startingPrompt,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    maxPlayers: game.maxPlayers ?? null,
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Game server listening on http://127.0.0.1:${PORT}`);
});


