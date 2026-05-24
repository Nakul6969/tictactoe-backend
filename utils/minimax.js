// Check if there's a winner on the board
function checkWinner(board, size) {
  const lines = [];

  // Rows
  for (let r = 0; r < size; r++) {
    lines.push([...Array(size)].map((_, c) => r * size + c));
  }

  // Columns
  for (let c = 0; c < size; c++) {
    lines.push([...Array(size)].map((_, r) => r * size + c));
  }

  // Diagonal (top-left to bottom-right)
  lines.push([...Array(size)].map((_, i) => i * size + i));

  // Diagonal (top-right to bottom-left)
  lines.push([...Array(size)].map((_, i) => i * size + (size - 1 - i)));

  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every(idx => board[idx] === first)) {
      return first; // returns 'X' or 'O'
    }
  }
  return null;
}

// The Minimax algorithm
function minimax(board, size, isMaximizing, depth, alpha, beta) {
  const winner = checkWinner(board, size);

  // Base cases
  if (winner === 'O') return 10 - depth;   // AI wins (sooner = better)
  if (winner === 'X') return depth - 10;   // Player wins
  if (board.every(cell => cell !== null)) return 0; // Draw

  if (isMaximizing) {
    // AI's turn — find highest score
    let best = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, size, false, depth + 1, alpha, beta));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // Alpha-beta pruning (makes AI faster)
      }
    }
    return best;
  } else {
    // Player's turn — find lowest score
    let best = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, size, true, depth + 1, alpha, beta));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return best;
  }
}

// Find the best move for AI
function getBestMove(board, size) {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, size, false, 0, -Infinity, Infinity);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

module.exports = { getBestMove, checkWinner };