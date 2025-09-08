import { PieceColor } from '../utils/chess-logic';

interface GameStatusProps {
  currentPlayer: PieceColor;
  whiteScore: number;
  blackScore: number;
  whiteTime: number;
  blackTime: number;
  isInCheck: boolean;
  isGameOver: boolean;
  winner: PieceColor | 'draw' | null;
}

export function GameStatus({
  currentPlayer,
  whiteScore,
  blackScore,
  whiteTime,
  blackTime,
  isInCheck,
  isGameOver,
  winner,
}: GameStatusProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    if (isGameOver) {
      if (winner === 'draw') return 'Game ended in a draw!';
      return `${winner === 'white' ? 'White' : 'Black'} wins!`;
    }
    if (isInCheck) {
      return `${currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
    }
    return `${currentPlayer === 'white' ? 'White' : 'Black'} to move`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      {/* Current Status */}
      <div className="text-center">
        <h2 className={`text-xl ${isInCheck ? 'text-red-600' : 'text-gray-800'}`}>
          {getStatusMessage()}
        </h2>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`text-center p-3 rounded-lg ${currentPlayer === 'white' ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-100'}`}>
          <div className="font-semibold text-gray-800">White</div>
          <div className="text-2xl">{whiteScore}</div>
          <div className={`text-sm ${whiteTime <= 60 ? 'text-red-600' : 'text-gray-600'}`}>
            ⏰ {formatTime(whiteTime)}
          </div>
        </div>
        <div className={`text-center p-3 rounded-lg ${currentPlayer === 'black' ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-100'}`}>
          <div className="font-semibold text-gray-800">Black</div>
          <div className="text-2xl">{blackScore}</div>
          <div className={`text-sm ${blackTime <= 60 ? 'text-red-600' : 'text-gray-600'}`}>
            ⏰ {formatTime(blackTime)}
          </div>
        </div>
      </div>

      {/* Score Difference */}
      <div className="text-center text-sm text-gray-600">
        {whiteScore > blackScore && (
          <span>White leads by {whiteScore - blackScore} point{whiteScore - blackScore !== 1 ? 's' : ''}</span>
        )}
        {blackScore > whiteScore && (
          <span>Black leads by {blackScore - whiteScore} point{blackScore - whiteScore !== 1 ? 's' : ''}</span>
        )}
        {whiteScore === blackScore && <span>Scores are tied</span>}
      </div>
    </div>
  );
}