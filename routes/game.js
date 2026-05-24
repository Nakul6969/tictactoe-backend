const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Game = require('../models/Game');
const { getBestMove, checkWinner } = require('../utils/minimax');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/game/ai-move
// @desc    Get AI's best move
// @access  Public
// ─────────────────────────────────────────
router.post('/ai-move', (req, res) => {
  try {
    const { board, size } = req.body;
    // board is an array like [null, 'X', null, 'O', null, null, null, null, null]
    // size is 3 for 3x3, 5 for 5x5

    const move = getBestMove(board, size || 3);
    res.json({ move });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────
// @route   POST /api/game/save
// @desc    Save game result
// @access  Private (needs token)
// ─────────────────────────────────────────
router.post('/save', protect, async (req, res) => {
  try {
    const { result, boardSize, moves } = req.body;

    const game = await Game.create({
      player: req.user.id,
      result,
      boardSize: boardSize || 3,
      moves
    });

    res.status(201).json({ message: 'Game saved!', game });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────
// @route   GET /api/game/leaderboard
// @desc    Get top players by wins
// @access  Public
// ─────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Game.aggregate([
      { $match: { result: 'win' } },         // only wins
      { $group: {
          _id: '$player',                     // group by player
          wins: { $sum: 1 },                  // count wins
          totalGames: { $sum: 1 }
        }
      },
      { $sort: { wins: -1 } },               // sort by most wins
      { $limit: 10 },                         // top 10 players
      { $lookup: {                            // join with Users collection
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'playerInfo'
        }
      },
      { $unwind: '$playerInfo' },
      { $project: {                           // choose what to return
          username: '$playerInfo.username',
          wins: 1,
          totalGames: 1
        }
      }
    ]);

    res.json(leaderboard);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────
// @route   GET /api/game/my-stats
// @desc    Get logged in player's stats
// @access  Private
// ─────────────────────────────────────────
router.get('/my-stats', protect, async (req, res) => {
  try {
    const stats = await Game.aggregate([
      { $match: { player: req.user.id } },
      { $group: {
          _id: '$result',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format into a nice object
    const formatted = { wins: 0, losses: 0, draws: 0 };
    stats.forEach(s => {
      formatted[s._id + 's'] = s.count;
    });

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;