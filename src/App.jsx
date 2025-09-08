import { useState, useEffect, useCallback } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { GameStatus } from './components/GameStatus';
import { PawnPromotionModal } from './components/PawnPromotionModal';
import { WinnerModal } from './components/WinnerModal';
import { Button } from './components/ui/button';

import {
  Board,
  Position,
  PieceColor,
  PieceType,
  Move,
  INITIAL_BOARD,
  isValidMove,
  getPossibleMoves,
  makeMove,
  isInCheck,
  isCheckmate,
  isStalemate,
  calculateScore,
  copyBoard,
} from './utils/chess-logic';

const GAME_TIME = 10 * 60; // 10 mins per player
const CHECKMATE_BONUS = 10;

interface GameState {
  board: Board;
  currentPlayer: PieceColor;
  selectedSquare: Position | null;
  validMoves: Position[];
  gameHistory: Move[];
  whiteTime: number;
  blackTime: number;
  whiteScore: number;
  blackScore: number;
  isGameOver: boolean;
  winner: PieceColor | 'draw' | null;
  winReason: string;
  enPassantTarget: Position | null;
  pendingPromotion: { move: Move; color: PieceColor } | null;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    board: copyBoard(INITIAL_BOARD),
    currentPlayer: 'white',
    selectedSquare: null,
    validMoves: [],
    gameHistory: [],
    whiteTime: GAME_TIME,
    blackTime: GAME_TIME,
    whiteScore: calculateScore(INITIAL_BOARD, 'white'),
    blackScore: calculateScore(INITIAL_BOARD, 'black'),
    isGameOver: false,
    winner: null,
    winReason: '',
    enPassantTarget: null,
    pendingPromotion: null,
  });

  // Timer effect
  useEffect(() => {
    if (gameState.isGameOver) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const isWhiteTurn = prev.currentPlayer === 'white';
        const timeKey = isWhiteTurn ? 'whiteTime' : 'blackTime';
        const newTime = prev[timeKey] - 1;

        if (newTime <= 0) {
          const whiteScore = calculateScore(prev.board, 'white');
          const blackScore = calculateScore(prev.board, 'black');

          const winner =
            blackScore > whiteScore
              ? 'black'
              : blackScore < whiteScore
              ? 'white'
              : 'draw';

          const winReason =
            winner === 'black'
              ? 'Black wins on time and points!'
              : winner === 'white'
              ? 'White wins on time and points!'
              : 'Draw - time expired with equal points!';

          return {
            ...prev,
            [timeKey]: 0,
            isGameOver: true,
            winner,
            winReason,
          };
        }
        return { ...prev, [timeKey]: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.currentPlayer, gameState.isGameOver]);

  const checkGameEnd = useCallback(
    (
      board: Board,
      player: PieceColor,
      enPassantTarget: Position | null
    ): Partial<GameState> | null => {
      if (isCheckmate(board, player, enPassantTarget)) {
        const winner = player === 'white' ? 'black' : 'white';
        const winnerScore = calculateScore(board, winner) + CHECKMATE_BONUS;

        return {
          isGameOver: true,
          winner,
          winReason: `Checkmate! ${
            winner === 'white' ? 'White' : 'Black'
          } wins!`,
          whiteScore: winner === 'white' ? winnerScore : undefined,
          blackScore: winner === 'black' ? winnerScore : undefined,
        };
      }
      if (isStalemate(board, player, enPassantTarget)) {
        return {
          isGameOver: true,
          winner: 'draw',
          winReason: 'Stalemate - Draw!',
        };
      }
      return null;
    },
    []
  );

  const handleSquareClick = (position: Position) => {
    if (gameState.isGameOver || gameState.pendingPromotion) return;

    const { board, selectedSquare, currentPlayer, enPassantTarget } = gameState;
    const clickedPiece = board[position.row][position.col];

    if (!selectedSquare) {
      if (clickedPiece && clickedPiece.color === currentPlayer) {
        const validMoves = getPossibleMoves(board, position, true, enPassantTarget);
        setGameState((prev) => ({
          ...prev,
          selectedSquare: position,
          validMoves: validMoves.map((move) => move.to),
        }));
      }
      return;
    }

    if (
      selectedSquare.row === position.row &&
      selectedSquare.col === position.col
    ) {
      setGameState((prev) => ({
        ...prev,
        selectedSquare: null,
        validMoves: [],
      }));
      return;
    }

    if (clickedPiece && clickedPiece.color === currentPlayer) {
      const validMoves = getPossibleMoves(board, position, true, enPassantTarget);
      setGameState((prev) => ({
        ...prev,
        selectedSquare: position,
        validMoves: validMoves.map((move) => move.to),
      }));
      return;
    }

    if (
      selectedSquare &&
      isValidMove(board, selectedSquare, position, enPassantTarget)
    ) {
      const selectedPiece = board[selectedSquare.row][selectedSquare.col];
      if (!selectedPiece) {
        // No piece found, reset selection
        setGameState((prev) => ({
          ...prev,
          selectedSquare: null,
          validMoves: [],
        }));
        return;
      }
      const possibleMoves = getPossibleMoves(board, selectedSquare, true, enPassantTarget);

      const move = possibleMoves.find(
        (m) => m.to.row === position.row && m.to.col === position.col
      );

      if (!move) return;

      if (
        selectedPiece.type === 'pawn' &&
        ((selectedPiece.color === 'white' && position.row === 0) ||
          (selectedPiece.color === 'black' && position.row === 7))
      ) {
        setGameState((prev) => ({
          ...prev,
          pendingPromotion: { move, color: selectedPiece.color },
          selectedSquare: null,
          validMoves: [],
        }));
        return;
      }

      executeMove(move);
    } else {
      setGameState((prev) => ({
        ...prev,
        selectedSquare: null,
        validMoves: [],
      }));
    }
  };

  const executeMove = (move: Move) => {
    const newBoard = makeMove(gameState.board, move);
    const nextPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';

    let newEnPassantTarget: Position | null = null;
    if (
      move.piece.type === 'pawn' &&
      Math.abs(move.from.row - move.to.row) === 2
    ) {
      newEnPassantTarget = {
        row: (move.from.row + move.to.row) / 2,
        col: move.to.col,
      };
    }

    const whiteScore = calculateScore(newBoard, 'white');
    const blackScore = calculateScore(newBoard, 'black');

    setGameState((prev) => {
      const gameEndState = checkGameEnd(newBoard, nextPlayer, newEnPassantTarget);

      return {
        ...prev,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedSquare: null,
        validMoves: [],
        gameHistory: [...prev.gameHistory, move],
        whiteScore,
        blackScore,
        enPassantTarget: newEnPassantTarget,
        ...(gameEndState || {}),
      };
    });
  };

  const handlePawnPromotion = (pieceType: PieceType) => {
    if (!gameState.pendingPromotion) return;

    const move: Move = {
      ...gameState.pendingPromotion.move,
      promotionPiece: pieceType,
    };

    setGameState((prev) => ({
      ...prev,
      pendingPromotion: null,
    }));

    executeMove(move);
  };

  const startNewGame = () => {
    setGameState({
      board: copyBoard(INITIAL_BOARD),
      currentPlayer: 'white',
      selectedSquare: null,
      validMoves: [],
      gameHistory: [],
      whiteTime: GAME_TIME,
      blackTime: GAME_TIME,
      whiteScore: calculateScore(INITIAL_BOARD, 'white'),
      blackScore: calculateScore(INITIAL_BOARD, 'black'),
      isGameOver: false,
      winner: null,
      winReason: '',
      enPassantTarget: null,
      pendingPromotion: null,
    });
  };

  const isCurrentPlayerInCheck = isInCheck(gameState.board, gameState.currentPlayer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">♟️ Chess Game</h1>
          <p className="text-gray-600">Two-player chess with real-time scoring and timer</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex justify-center">
            <ChessBoard
              board={gameState.board}
              selectedSquare={gameState.selectedSquare}
              validMoves={gameState.validMoves}
              currentPlayer={gameState.currentPlayer}
              onSquareClick={handleSquareClick}
            />
          </div>

          <div className="space-y-4">
            <GameStatus
              currentPlayer={gameState.currentPlayer}
              whiteScore={gameState.whiteScore}
              blackScore={gameState.blackScore}
              whiteTime={gameState.whiteTime}
              blackTime={gameState.blackTime}
              isInCheck={isCurrentPlayerInCheck}
              isGameOver={gameState.isGameOver}
              winner={gameState.winner}
            />

            <Button onClick={startNewGame} className="w-full" variant="outline">
              New Game
            </Button>
          </div>
        </div>

        <PawnPromotionModal
          isOpen={!!gameState.pendingPromotion}
          color={gameState.pendingPromotion?.color || 'white'}
          onSelect={handlePawnPromotion}
        />

        <WinnerModal
          isOpen={gameState.isGameOver}
          winner={gameState.winner}
          winReason={gameState.winReason}
          whiteScore={gameState.whiteScore}
          blackScore={gameState.blackScore}
          onNewGame={startNewGame}
        />
      </div>
    </div>
  );
}
