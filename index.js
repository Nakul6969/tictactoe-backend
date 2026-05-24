require('dotenv').config();             // ← MUST be first line!

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('./models/User');
require('./models/Game');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));  
app.use('/api/game', require('./routes/game'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Apex TicTacToe API is running!' });
});

// Connect to MongoDB, then start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });