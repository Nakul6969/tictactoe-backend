const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,  // links to User
    ref: 'User',
    required: true
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'draw'],         // only these 3 values allowed
    required: true
  },
  boardSize: {
    type: Number,
    default: 3                             // 3 = 3x3, 5 = 5x5
  },
  moves: {
    type: Number,                          // how many moves the game lasted
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', GameSchema);