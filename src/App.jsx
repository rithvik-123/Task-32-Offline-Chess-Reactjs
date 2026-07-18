import React, { useState, useEffect } from 'react';
import { createInitialBoard, getPieceSymbol, getLegalMoves, isKingInCheck, toChessNotation } from './utils/chessLogic';
import './App.css';

function App() {
  const [board, setBoard] = useState(createInitialBoard());
  const [turn, setTurn] = useState('w'); // 'w' stands for white, 'b' stands for black
  const [selectedPiece, setSelectedPiece] = useState(null); 
  const [legalHighlights, setLegalHighlights] = useState([]);
  const [moveList, setMoveList] = useState([]);
  const [gameStatus, setGameStatus] = useState('Active'); 
  
  // Added state for captured pieces
  const [whiteCaptured, setWhiteCaptured] = useState([]);
  const [blackCaptured, setBlackCaptured] = useState([]);

  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes
  const [blackTime, setBlackTime] = useState(600);

  // Timer logic
  useEffect(() => {
    if (gameStatus === 'Checkmate' || gameStatus === 'Draw') {
        return; // Stop timer if game is over
    }

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prevTime) => {
          if (prevTime <= 1) { 
              setGameStatus('Black wins on time'); 
              clearInterval(timer); 
          }
          return prevTime - 1;
        });
      } else {
        setBlackTime((prevTime) => {
          if (prevTime <= 1) { 
              setGameStatus('White wins on time'); 
              clearInterval(timer); 
          }
          return prevTime - 1;
        });
      }
    }, 1000);

    // Cleanup the timer when turn changes
    return () => clearInterval(timer);
  }, [turn, gameStatus]);

  function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    if (secs < 10) {
        secs = '0' + secs; // add a zero for single digits
    }
    return mins + ':' + secs;
  }

  function handleSquareClick(row, col) {
    if (gameStatus === 'Checkmate' || gameStatus.includes('wins')) {
        return; // Don't allow clicks if game is over
    }

    let clickedPiece = board[row][col];

    // If we already selected a piece, see if we can move it here
    if (selectedPiece !== null) {
      let isLegalMove = false;
      
      // Loop to check if the clicked square is in our legal highlights
      for (let i = 0; i < legalHighlights.length; i++) {
        if (legalHighlights[i].row === row && legalHighlights[i].col === col) {
            isLegalMove = true;
        }
      }

      if (isLegalMove === true) {
        let movingPiece = board[selectedPiece.row][selectedPiece.col];
        let isCapture = false;
        
        // Check if we are capturing an enemy piece
        if (board[row][col] !== null) {
            isCapture = true;
            // Add to captured lists
            if (turn === 'w') {
                setWhiteCaptured([...whiteCaptured, board[row][col]]);
            } else {
                setBlackCaptured([...blackCaptured, board[row][col]]);
            }
        }

        // Get the text for the move list (like e4 or Nxd4)
        let notation = toChessNotation(movingPiece, selectedPiece.col, row, col, isCapture);

        // Make a copy of the board and move the piece
        let newBoard = [];
        for (let r = 0; r < 8; r++) {
            newBoard.push([...board[r]]);
        }
        newBoard[row][col] = movingPiece;
        newBoard[selectedPiece.row][selectedPiece.col] = null;

        // Figure out whose turn is next
        let nextPlayer = 'w';
        if (turn === 'w') {
            nextPlayer = 'b';
        }

        // Check for check and checkmate
        let isCheck = isKingInCheck(nextPlayer, newBoard);
        
        let playerHasMoves = false;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (newBoard[r][c] !== null && newBoard[r][c][0] === nextPlayer) {
              let moves = getLegalMoves(r, c, newBoard);
              if (moves.length > 0) {
                playerHasMoves = true;
              }
            }
          }
        }

        if (isCheck === true) {
          if (playerHasMoves === false) {
            setGameStatus('Checkmate');
            setMoveList([...moveList, notation + '#']); // Hashtag means checkmate
          } else {
            setGameStatus('Check');
            setMoveList([...moveList, notation + '+']); // Plus means check
          }
        } else {
          if (playerHasMoves === false) {
            setGameStatus('Draw (Stalemate)');
            setMoveList([...moveList, notation]);
          } else {
            setGameStatus('Active');
            setMoveList([...moveList, notation]);
          }
        }

        // Update the state with the new board and turn
        setBoard(newBoard);
        setTurn(nextPlayer);
        setSelectedPiece(null);
        setLegalHighlights([]);
        return; // Stop the function here
      }
    }

    // If we didn't move, check if we clicked one of our own pieces to select it
    if (clickedPiece !== null && clickedPiece[0] === turn) {
      setSelectedPiece({ row: row, col: col });
      setLegalHighlights(getLegalMoves(row, col, board));
    } else {
      // Clicked an empty square or enemy piece without selecting first
      setSelectedPiece(null);
      setLegalHighlights([]);
    }
  }

  function resetGame() {
    setBoard(createInitialBoard());
    setTurn('w');
    setSelectedPiece(null);
    setLegalHighlights([]);
    setMoveList([]);
    setGameStatus('Active');
    setWhiteTime(600);
    setBlackTime(600);
    setWhiteCaptured([]);
    setBlackCaptured([]);
  }

  return (
    <div className="app-container">
      <h1>My React Chess Game</h1>

      <div className="status-message">
        <h2>Status: {gameStatus}</h2>
      </div>

      <div className="main-layout">
        
        <div className="board-section">
          {/* Black Player Info */}
          <div className="player-info">
            <span>Black Player - {formatTime(blackTime)}</span>
            <div className="captured-pieces">
               {/* Display pieces white has captured FROM black */}
               {whiteCaptured.map((piece, index) => (
                  <span key={index} className="black-piece-text">{getPieceSymbol(piece)}</span>
               ))}
            </div>
          </div>

          <div className="chess-board">
            {board.map((rowArr, rowIndex) => {
              return rowArr.map((piece, colIndex) => {
                // Math to figure out if square should be light or dark color
                let isDarkSquare = (rowIndex + colIndex) % 2 !== 0;
                
                let isSelected = false;
                if (selectedPiece !== null && selectedPiece.row === rowIndex && selectedPiece.col === colIndex) {
                    isSelected = true;
                }

                let isHighlighted = false;
                for (let i = 0; i < legalHighlights.length; i++) {
                    if (legalHighlights[i].row === rowIndex && legalHighlights[i].col === colIndex) {
                        isHighlighted = true;
                    }
                }

                let squareClass = 'square';
                if (isDarkSquare) squareClass += ' dark-square';
                else squareClass += ' light-square';
                if (isSelected) squareClass += ' selected-square';

                let pieceColorClass = '';
                if (piece !== null) {
                    if (piece[0] === 'w') pieceColorClass = 'white-piece-text';
                    else pieceColorClass = 'black-piece-text';
                }

                return (
                  <div
                    key={rowIndex + '-' + colIndex}
                    className={squareClass}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                  >
                    {isHighlighted && <div className="dot"></div>}
                    <span className={`piece ${pieceColorClass}`}>
                      {getPieceSymbol(piece)}
                    </span>
                  </div>
                );
              });
            })}
          </div>

          {/* White Player Info */}
          <div className="player-info">
            <span>White Player - {formatTime(whiteTime)}</span>
            <div className="captured-pieces">
               {/* Display pieces black has captured FROM white */}
               {blackCaptured.map((piece, index) => (
                  <span key={index} className="white-piece-text">{getPieceSymbol(piece)}</span>
               ))}
            </div>
          </div>
        </div>

        <div className="side-panel">
          <h3>Move History</h3>
          <div className="move-list-container">
            <ul>
              {moveList.map((move, index) => {
                // Grouping moves in pairs (White, Black) for display
                if (index % 2 === 0) {
                   let moveNumber = (index / 2) + 1;
                   let blackMove = moveList[index + 1] ? moveList[index + 1] : '';
                   return (
                     <li key={index}>
                       {moveNumber}. {move} {blackMove}
                     </li>
                   );
                }
                return null;
              })}
            </ul>
          </div>
          <button onClick={resetGame} className="reset-button">Start New Game</button>
        </div>

      </div>
    </div>
  );
}

export default App;