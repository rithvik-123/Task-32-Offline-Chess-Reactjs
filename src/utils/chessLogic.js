// Initial layout array of an 8x8 chess board.
// Pieces represented by strings: 'wP' = White Pawn, 'bR' = Black Rook, etc. null = empty square.
export const createInitialBoard = () => [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

// Returns standard Unicode glyphs to beautifully map pieces without needing heavy image sets
export const getPieceSymbol = (piece) => {
  if (!piece) return '';
  const symbols = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
  };
  return symbols[piece] || '';
};

// Converts indices to Standard Chess Notation (e.g. 6,4 to 'e2')
export const toChessNotation = (pieceType, fromCol, toRow, toCol, isCapture) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  let pieceCode = pieceType.substring(1);
  if (pieceCode === 'P') {
    return `${isCapture ? files[fromCol] : ''}${isCapture ? 'x' : ''}${files[toCol]}${ranks[toRow]}`;
  }
  return `${pieceCode}${isCapture ? 'x' : ''}${files[toCol]}${ranks[toRow]}`;
};

// Generates pseudo-legal moves based on basic piece movement properties
export const getPseudoLegalMoves = (row, col, board) => {
  const piece = board[row][col];
  if (!piece) return [];
  const color = piece[0];
  const type = piece[1];
  const moves = [];

  const addMoveIfValid = (r, c) => {
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (!board[r][c] || board[r][c][0] !== color) {
        moves.push({ row: r, col: c });
        return !board[r][c]; // Continue sliding if empty
      }
    }
    return false;
  };

  if (type === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    
    // Single step forward
    if (row + dir >= 0 && row + dir < 8 && !board[row + dir][col]) {
      moves.push({ row: row + dir, col: col });
      // Double step forward
      if (row === startRow && !board[row + 2 * dir][col]) {
        moves.push({ row: row + 2 * dir, col: col });
      }
    }
    // Captures
    [-1, 1].forEach(dCol => {
      const nextR = row + dir;
      const nextC = col + dCol;
      if (nextR >= 0 && nextR < 8 && nextC >= 0 && nextC < 8) {
        const target = board[nextR][nextC];
        if (target && target[0] !== color) {
          moves.push({ row: nextR, col: nextC });
        }
      }
    });
  }

  if (type === 'R' || type === 'Q') {
    const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
    dirs.forEach(([dr, dc]) => {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (!addMoveIfValid(r, c)) break;
        r += dr; c += dc;
      }
    });
  }

  if (type === 'B' || type === 'Q') {
    const dirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
    dirs.forEach(([dr, dc]) => {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (!addMoveIfValid(r, c)) break;
        r += dr; c += dc;
      }
    });
  }

  if (type === 'N') {
    const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    offsets.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
  }

  if (type === 'K') {
    const offsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    offsets.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
  }

  return moves;
};

// Finds coordinates of a color's King
export const findKing = (color, board) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === `${color}K`) return { row: r, col: c };
    }
  }
  return null;
};

// Verifies if a color's King is currently targeted by any opponent piece paths
export const isKingInCheck = (color, board) => {
  const kingPos = findKing(color, board);
  if (!kingPos) return false;

  const opponentColor = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && board[r][c][0] === opponentColor) {
        const moves = getPseudoLegalMoves(r, c, board);
        if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

// Simulates the move to filter out paths that leave or place the current player's King under check
export const getLegalMoves = (row, col, board) => {
  const piece = board[row][col];
  if (!piece) return [];
  const pseudoMoves = getPseudoLegalMoves(row, col, board);
  
  return pseudoMoves.filter(move => {
    // Clone board state array
    const testBoard = board.map(r => [...r]);
    testBoard[move.row][move.col] = piece;
    testBoard[row][col] = null;
    return !isKingInCheck(piece[0], testBoard);
  });
};