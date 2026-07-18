// I will use a simple array to represent the board.
export function createInitialBoard() {
  let board = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
  ];
  return board;
}

// Just using a switch statement to get the symbols. Easier to read.
export function getPieceSymbol(piece) {
  if (piece === null) return '';
  switch (piece) {
    case 'wK': return '♔';
    case 'wQ': return '♕';
    case 'wR': return '♖';
    case 'wB': return '♗';
    case 'wN': return '♘';
    case 'wP': return '♙';
    case 'bK': return '♚';
    case 'bQ': return '♛';
    case 'bR': return '♜';
    case 'bB': return '♝';
    case 'bN': return '♞';
    case 'bP': return '♟';
    default: return '';
  }
}

// Convert the row and col into chess letters like e4
export function toChessNotation(pieceType, fromCol, toRow, toCol, isCapture) {
  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  // Math to flip the rows since arrays start at 0 at the top, but chess starts at 8
  const rowNumber = 8 - toRow; 
  
  let pieceName = pieceType[1]; // Get the P, R, N, etc.
  
  if (pieceName === 'P') {
    if (isCapture) {
      return columns[fromCol] + 'x' + columns[toCol] + rowNumber;
    } else {
      return columns[toCol] + rowNumber;
    }
  }
  
  if (isCapture) {
     return pieceName + 'x' + columns[toCol] + rowNumber;
  } else {
     return pieceName + columns[toCol] + rowNumber;
  }
}

// Getting moves without worrying about checks yet
export function getPseudoLegalMoves(row, col, board) {
  let piece = board[row][col];
  if (piece === null) return [];
  
  let color = piece[0];
  let type = piece[1];
  let moves = [];

  // Pawns are tricky because white and black go different ways
  if (type === 'P') {
    let direction = 1;
    if (color === 'w') {
        direction = -1;
    }
    
    let startRow = 1;
    if (color === 'w') {
        startRow = 6;
    }

    // Move forward 1 space
    if (row + direction >= 0 && row + direction <= 7) {
      if (board[row + direction][col] === null) {
        moves.push({ row: row + direction, col: col });
        
        // Move forward 2 spaces if it's the first move
        if (row === startRow && board[row + (direction * 2)][col] === null) {
          moves.push({ row: row + (direction * 2), col: col });
        }
      }
    }
    
    // Pawn captures
    let leftCol = col - 1;
    let rightCol = col + 1;
    let nextRow = row + direction;
    
    if (nextRow >= 0 && nextRow <= 7) {
      if (leftCol >= 0 && board[nextRow][leftCol] !== null && board[nextRow][leftCol][0] !== color) {
        moves.push({ row: nextRow, col: leftCol });
      }
      if (rightCol <= 7 && board[nextRow][rightCol] !== null && board[nextRow][rightCol][0] !== color) {
        moves.push({ row: nextRow, col: rightCol });
      }
    }
  }

  // Rooks move in straight lines. I'll use simple while loops.
  if (type === 'R' || type === 'Q') {
    // Up
    let r = row - 1;
    while (r >= 0) {
      if (board[r][col] === null) { moves.push({row: r, col: col}); r--; }
      else { if (board[r][col][0] !== color) moves.push({row: r, col: col}); break; }
    }
    // Down
    r = row + 1;
    while (r <= 7) {
      if (board[r][col] === null) { moves.push({row: r, col: col}); r++; }
      else { if (board[r][col][0] !== color) moves.push({row: r, col: col}); break; }
    }
    // Left
    let c = col - 1;
    while (c >= 0) {
      if (board[row][c] === null) { moves.push({row: row, col: c}); c--; }
      else { if (board[row][c][0] !== color) moves.push({row: row, col: c}); break; }
    }
    // Right
    c = col + 1;
    while (c <= 7) {
      if (board[row][c] === null) { moves.push({row: row, col: c}); c++; }
      else { if (board[row][c][0] !== color) moves.push({row: row, col: c}); break; }
    }
  }

  // Bishops move diagonally
  if (type === 'B' || type === 'Q') {
    let directions = [[-1,-1], [-1,1], [1,-1], [1,1]];
    for (let i = 0; i < directions.length; i++) {
        let dr = directions[i][0];
        let dc = directions[i][1];
        let r = row + dr;
        let c = col + dc;
        
        while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
            if (board[r][c] === null) {
                moves.push({row: r, col: c});
            } else {
                if (board[r][c][0] !== color) {
                    moves.push({row: r, col: c});
                }
                break; // Stop at first piece we hit
            }
            r += dr;
            c += dc;
        }
    }
  }

  // Knights use an L-shape jump
  if (type === 'N') {
    let jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (let i = 0; i < jumps.length; i++) {
        let r = row + jumps[i][0];
        let c = col + jumps[i][1];
        if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
            if (board[r][c] === null || board[r][c][0] !== color) {
                moves.push({row: r, col: c});
            }
        }
    }
  }

  // King moves 1 step any way
  if (type === 'K') {
    let steps = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for (let i = 0; i < steps.length; i++) {
        let r = row + steps[i][0];
        let c = col + steps[i][1];
        if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
            if (board[r][c] === null || board[r][c][0] !== color) {
                moves.push({row: r, col: c});
            }
        }
    }
  }

  return moves;
}

// Find where the king is to check for danger
function findKing(color, currentBoard) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (currentBoard[r][c] === color + 'K') {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

// Check if the king is being attacked
export function isKingInCheck(color, currentBoard) {
  let kingLocation = findKing(color, currentBoard);
  if (kingLocation === null) return false;

  let enemyColor = 'w';
  if (color === 'w') {
     enemyColor = 'b';
  }

  // Go through the whole board and see if any enemy piece can move to the king's spot
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let piece = currentBoard[r][c];
      if (piece !== null && piece[0] === enemyColor) {
        let enemyMoves = getPseudoLegalMoves(r, c, currentBoard);
        
        for (let i = 0; i < enemyMoves.length; i++) {
            if (enemyMoves[i].row === kingLocation.row && enemyMoves[i].col === kingLocation.col) {
                return true; // The king is in check!
            }
        }
      }
    }
  }
  return false;
}

// Filter out moves that would put our own king in check
export function getLegalMoves(row, col, board) {
  let piece = board[row][col];
  if (piece === null) return [];
  
  let possibleMoves = getPseudoLegalMoves(row, col, board);
  let safeMoves = [];
  
  for (let i = 0; i < possibleMoves.length; i++) {
    let move = possibleMoves[i];
    
    // Make a copy of the board to test the move
    let testBoard = [];
    for (let r = 0; r < 8; r++) {
        testBoard.push([...board[r]]);
    }
    
    // Do the fake move
    testBoard[move.row][move.col] = piece;
    testBoard[row][col] = null;
    
    // If the king is NOT in check after this move, it is safe
    if (isKingInCheck(piece[0], testBoard) === false) {
        safeMoves.push(move);
    }
  }
  
  return safeMoves;
}