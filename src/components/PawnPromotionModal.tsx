import { PieceType, PieceColor, getPieceSymbol } from '../utils/chess-logic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface PawnPromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (pieceType: PieceType) => void;
}

export function PawnPromotionModal({ isOpen, color, onSelect }: PawnPromotionModalProps) {
  const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose promotion piece</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 p-4">
          {promotionPieces.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="w-16 h-16 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <span className="text-4xl">
                {getPieceSymbol({ type: pieceType, color })}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}