import { ChessPiece as ChessPieceType, getPieceSymbol } from '../utils/chess-logic';

interface ChessPieceProps {
  piece: ChessPieceType | null;
  isSelected: boolean;
  isValidMove: boolean;
  isInCheck: boolean;
  onClick: () => void;
}

export function ChessPiece({ piece, isSelected, isValidMove, isInCheck, onClick }: ChessPieceProps) {
  return (
    <div
      className={`
        w-full h-full flex items-center justify-center cursor-pointer transition-all duration-200
        ${isSelected ? 'bg-blue-400 bg-opacity-50' : ''}
        ${isValidMove ? 'bg-green-400 bg-opacity-50' : ''}
        ${isInCheck ? 'bg-red-400 bg-opacity-50 animate-pulse' : ''}
        hover:bg-gray-200 hover:bg-opacity-30
      `}
      onClick={onClick}
    >
      {piece && (
        <span className="text-4xl select-none">
          {getPieceSymbol(piece)}
        </span>
      )}
      {isValidMove && !piece && (
        <div className="w-4 h-4 bg-green-500 rounded-full opacity-60" />
      )}
    </div>
  );
}