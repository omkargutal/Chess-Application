import { Board, Position, findKing, PieceColor } from '../utils/chess-logic';
import { ChessPiece } from './ChessPiece';

interface ChessBoardProps {
  board: Board;
  selectedSquare: Position | null;
  validMoves: Position[];
  currentPlayer: PieceColor;
  onSquareClick: (position: Position) => void;
}

export function ChessBoard({ 
  board, 
  selectedSquare, 
  validMoves, 
  currentPlayer,
  onSquareClick 
}: ChessBoardProps) {
  const kingInCheck = findKing(board, currentPlayer);
  
  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };
  
  const isValidMoveSquare = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };
  
  const isKingInCheck = (row: number, col: number) => {
    return kingInCheck?.row === row && kingInCheck?.col === col;
  };
  
  const isLightSquare = (row: number, col: number) => {
    return (row + col) % 2 === 0;
  };

  return (
    <div className="grid grid-cols-8 gap-0 border-2 border-gray-800 bg-white">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`
              w-16 h-16 border border-gray-300
              ${isLightSquare(rowIndex, colIndex) ? 'bg-amber-100' : 'bg-amber-800'}
            `}
          >
            <ChessPiece
              piece={piece}
              isSelected={isSquareSelected(rowIndex, colIndex)}
              isValidMove={isValidMoveSquare(rowIndex, colIndex)}
              isInCheck={isKingInCheck(rowIndex, colIndex)}
              onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
            />
          </div>
        ))
      )}
    </div>
  );
}