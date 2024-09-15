import React, { useState, useEffect } from "react";
import "./Match.css";

// Directions as [row, col] offsets for 8 possible directions
const directions = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
  [-1, -1], // up-left diagonal
  [-1, 1], // up-right diagonal
  [1, -1], // down-left diagonal
  [1, 1], // down-right diagonal
];

const Match: React.FC = () => {
  // 8x8 grid with initial Othello setup (2 black and 2 white in the center)
  const initialBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  initialBoard[3][3] = 1; // White
  initialBoard[3][4] = 0; // Black
  initialBoard[4][3] = 0; // Black
  initialBoard[4][4] = 1; // White

  const [board, setBoard] = useState(initialBoard); // Board state
  const [isPlayer1Turn, setIsPlayer1Turn] = useState(true); // Track the current player's turn
  const [validMoves, setValidMoves] = useState<number[][]>([]); // Store valid moves for the current player
  const [player1Count, setPlayer1Count] = useState(2); // Player 1 piece count (Black)
  const [player2Count, setPlayer2Count] = useState(2); // Player 2 piece count (White)
  const [gameOver, setGameOver] = useState(false); // Track if the game is over
  const [winner, setWinner] = useState<string | null>(null); // Track the winner

  // Function to check in all directions and return true if it's a valid move
  const isValidMove = (rowIndex: number, colIndex: number, player: number, board: number[][]) => {
    const opponent = 1 - player;
    for (const dir of directions) {
      let r = rowIndex + dir[0];
      let c = colIndex + dir[1];
      let foundOpponent = false;

      while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
        foundOpponent = true;
        r += dir[0];
        c += dir[1];
      }

      if (foundOpponent && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
        return true;
      }
    }
    return false;
  };

  // Function to update the list of valid moves
  const updateValidMoves = (currentPlayer: number, currentBoard: number[][]) => {
    const moves: number[][] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (currentBoard[row][col] === null && isValidMove(row, col, currentPlayer, currentBoard)) {
          moves.push([row, col]);
        }
      }
    }
    setValidMoves(moves);
  };

  // Call this on each render to update the valid moves for the current player
  useEffect(() => {
    updateValidMoves(isPlayer1Turn ? 0 : 1, board);
  }, [isPlayer1Turn, board]);

  // Function to check if a move is valid and flip pieces
  const handleClick = (rowIndex: number, colIndex: number) => {
    if (gameOver || board[rowIndex][colIndex] !== null) return;

    const currentPlayer = isPlayer1Turn ? 0 : 1; // Black = 0, White = 1
    const opponent = 1 - currentPlayer;
    let validMove = false;
    const newBoard = [...board]; // Clone the board state

    const flipInDirection = (row: number, col: number, dir: number[]) => {
      let r = row + dir[0];
      let c = col + dir[1];
      const cellsToFlip = [];

      while (r >= 0 && r < 8 && c >= 0 && c < 8 && newBoard[r][c] === opponent) {
        cellsToFlip.push([r, c]);
        r += dir[0];
        c += dir[1];
      }

      if (r >= 0 && r < 8 && c >= 0 && c < 8 && newBoard[r][c] === currentPlayer) {
        cellsToFlip.forEach(([flipRow, flipCol]) => {
          newBoard[flipRow][flipCol] = currentPlayer;
        });
        return cellsToFlip.length > 0;
      }
      return false;
    };

    directions.forEach((dir) => {
      if (flipInDirection(rowIndex, colIndex, dir)) {
        validMove = true;
      }
    });

    if (validMove) {
      newBoard[rowIndex][colIndex] = currentPlayer;
      setBoard(newBoard); // Update the board
      setIsPlayer1Turn(!isPlayer1Turn); // Switch turns

      // Count the number of pieces for each player
      const player1Count = newBoard.flat().filter((cell) => cell === 0).length;
      const player2Count = newBoard.flat().filter((cell) => cell === 1).length;
      setPlayer1Count(player1Count);
      setPlayer2Count(player2Count);

      if (checkGameOver(newBoard)) {
        endGame(newBoard);
      }
    }
  };

  // Function to check if there are any valid moves left for a player
  const hasValidMove = (player: number, currentBoard: number[][]) => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (currentBoard[row][col] === null && isValidMove(row, col, player, currentBoard)) {
          return true;
        }
      }
    }
    return false;
  };

  // Function to check if the game is over (either board is full or no valid moves left)
  const checkGameOver = (currentBoard: number[][]) => {
    const isBoardFull = currentBoard.every((row) => row.every((cell) => cell !== null));
    const noMovesForBothPlayers =
      !hasValidMove(0, currentBoard) && !hasValidMove(1, currentBoard);

    return isBoardFull || noMovesForBothPlayers;
  };

  // Function to end the game and determine the winner
  const endGame = (currentBoard: number[][]) => {
    setGameOver(true);
    const player1Count = currentBoard.flat().filter((cell) => cell === 0).length;
    const player2Count = currentBoard.flat().filter((cell) => cell === 1).length;

    if (player1Count > player2Count) {
      setWinner("Player 1 (Black) Wins!");
    } else if (player2Count > player1Count) {
      setWinner("Player 2 (White) Wins!");
    } else {
      setWinner("It's a Draw!");
    }
  };

  return (
    <div className="match-container">
      {gameOver ? (
        <div className="game-over">
          <h1>Game Over</h1>
          <h2>{winner}</h2>
        </div>
      ) : (
        <>
          <div className="player-zone player1">
            Player 1 (Black): {player1Count} {isPlayer1Turn ? "(Your turn)" : ""}
          </div>
          <div className="player-zone player2">
            Player 2 (White): {player2Count} {!isPlayer1Turn ? "(Your turn)" : ""}
          </div>

          <div className="board">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((cell, colIndex) => {
                  const isValidMoveForPlayer = validMoves.some(
                    (move) => move[0] === rowIndex && move[1] === colIndex
                  );
                  return (
                    <div
                      key={colIndex}
                      className={`board-cell ${cell === 1 ? "white" : cell === 0 ? "black" : ""} ${
                        isValidMoveForPlayer ? "valid-move" : ""
                      }`}
                      onClick={() => handleClick(rowIndex, colIndex)}
                    >
                      {cell !== null ? "" : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Match;
