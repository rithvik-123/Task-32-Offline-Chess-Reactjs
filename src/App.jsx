import React, { useState, useEffect } from 'react';
import { createInitialBoard, getPieceSymbol, getLegalMoves, isKingInCheck, toChessNotation } from './utils/chessLogic';
import './App.css';

function App() {
  const [board, setBoard] = useState(createInitialBoard());
  const [turn, setTurn] = useState('w'); // 'w' = White, 'b' = Black
  const [selectedPiece, setSelectedPiece] = useState(null); // {row, col}
  const [legalHighlights, setLegalHighlights] = useState([]);
  const [moveList, setMoveList] = useState([]);
  const [gameStatus, setGameStatus] = useState('Active'); // Active, Check, Checkmate, Draw
  
  // Timers: 10 minutes (600 seconds) per player
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  // Timer Countdown Loop
  useEffect(() => {
    if (gameStatus === 'Checkmate' || gameStatus === 'Draw') return;

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) { setGameStatus('Black wins on time'); clearInterval(timer); }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) { setGameStatus('White wins on time'); clearInterval(timer); }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, gameStatus]);

  // Formats time display nicely
  const formatTime = (timeInSecs) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = timeInSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Click Handler for Chess Squares
  const handleSquareClick = (row, col) => {
    if (gameStatus.includes('wins') || gameStatus === 'Checkmate') return;

    const piece = board[row][col];

    // If a piece is already selected, try to execute movement logic
    if (selectedPiece) {
      const isLegal = legalHighlights.some(m => m.row === row && m.col === col);

      if (isLegal) {
        const fromRow = selectedPiece.row;
        const fromCol = selectedPiece.col;
        const movingPiece = board[fromRow][fromCol];
        const isCapture = board[row][col] !== null;

        // Formulate Standard Algebraic Notation notation text
        const notation = toChessNotation(movingPiece, fromCol, row, col, isCapture);

        // Perform grid update swap
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = movingPiece;
        newBoard[fromRow][fromCol] = null;

        // Evaluate conditions for next player turn
        const nextPlayer = turn === 'w' ? 'b' : 'w';
        const checkActive = isKingInCheck(nextPlayer, newBoard);
        
        // Scan for legal moves left for the opponent player to check for Checkmate
        let hasAnyLegalMoves = false;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (newBoard[r][c] && newBoard[r][c][0] === nextPlayer) {
              if (getLegalMoves(r, c, newBoard).length > 0) {
                hasAnyLegalMoves = true;
                break;
              }
            }
          }
        }

        // Apply game end or alert states
        if (checkActive) {
          if (!hasAnyLegalMoves) {
            setGameStatus('Checkmate');
            setMoveList(prev => [...prev, `${notation}#`]);
          } else {
            setGameStatus('Check');
            setMoveList(prev => [...prev, `${notation}+`]);
          }
        } else {
          if (!hasAnyLegalMoves) {
            setGameStatus('Draw (Stalemate)');
          } else {
            setGameStatus('Active');
          }
          setMoveList(prev => [...prev, notation]);
        }

        setBoard(newBoard);
        setTurn(nextPlayer);
        setSelectedPiece(null);
        setLegalHighlights([]);
        return;
      }
    }

    // Select piece selection criteria
    if (piece && piece[0] === turn) {
      setSelectedPiece({ row, col });
      setLegalHighlights(getLegalMoves(row, col, board));
    } else {
      setSelectedPiece(null);
      setLegalHighlights([]);
    }
  };

  // Optional Enhancement Logic Feature: Reset Game Hook
  const resetGame = () => {
    setBoard(createInitialBoard());
    setTurn('w');
    setSelectedPiece(null);
    setLegalHighlights([]);
    setMoveList([]);
    setGameStatus('Active');
    setWhiteTime(600);
    setBlackTime(600);
  };

  return (
    <div className="chess-app">
      <h1 className="main-title">Offline Chess Core</h1>

      {gameStatus !== 'Active' && gameStatus !== 'Check' && (
        <div className="alert-banner game-over">{gameStatus}!</div>
      )}
      {gameStatus === 'Check' && <div className="alert-banner check-warning">Check!</div>}

      <div className="game-layout">
        {/* Main Chessboard View Block */}
        <div className="board-wrapper">
          {/* Black Player Banner Header */}
          <div className={`player-bar ${turn === 'b' ? 'active-turn' : ''}`}>
            <span>Player Black</span>
            <span className="timer-box">⏱ {formatTime(blackTime)}</span>
          </div>

          <div className="chessboard">
            {board.map((rowArr, rIdx) =>
              rowArr.map((piece, cIdx) => {
                const isDark = (rIdx + cIdx) % 2 === 1;
                const isSelected = selectedPiece && selectedPiece.row === rIdx && selectedPiece.col === cIdx;
                const isHighlighted = legalHighlights.some(h => h.row === rIdx && h.col === cIdx);

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSquareClick(rIdx, cIdx)}
                  >
                    {isHighlighted && <div className="highlight-dot" />}
                    <span className={`chess-piece ${piece && piece[0] === 'w' ? 'white-p' : 'black-p'}`}>
                      {getPieceSymbol(piece)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* White Player Banner Footer */}
          <div className={`player-bar ${turn === 'w' ? 'active-turn' : ''}`}>
            <span>Player White</span>
            <span className="timer-box">⏱ {formatTime(whiteTime)}</span>
          </div>
        </div>

        {/* Move History / Dashboard Sidebar Panel */}
        <div className="sidebar-panel">
          <h3>Move List</h3>
          <div className="move-history-box">
            {moveList.length === 0 ? <p className="empty-msg">No moves recorded yet.</p> : (
              <ol className="notation-list">
                {Math.ceil(moveList.length / 2) > 0 && 
                  Array.from({ length: Math.ceil(moveList.length / 2) }).map((_, index) => (
                    <li key={index} className="notation-row">
                      <span className="move-move">{moveList[index * 2]}</span>
                      <span className="move-move">{moveList[index * 2 + 1] || ''}</span>
                    </li>
                  ))
                }
              </ol>
            )}
          </div>
          <button className="reset-btn" onClick={resetGame}>Reset Match</button>
        </div>
      </div>
    </div>
  );
}

export default App;