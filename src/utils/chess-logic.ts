export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionPiece?: PieceType;
}

export type Board = (ChessPiece | null)[][];

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

export const INITIAL_BOARD: Board = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' })),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ],
];

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

export function copyBoard(board: Board): Board {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}

export function findKing(board: Board, color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor = color === 'white' ? 'black' : 'white';
  
  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getPossibleMoves(board, { row, col }, false);
        if (moves.some(move => move.to.row === kingPos.row && move.to.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isValidMove(board: Board, from: Position, to: Position, enPassantTarget?: Position): boolean {
  const piece = board[from.row][from.col];
  if (!piece) return false;

  const moves = getPossibleMoves(board, from, true, enPassantTarget);
  return moves.some(move => move.to.row === to.row && move.to.col === to.col);
}

export function getPossibleMoves(
  board: Board, 
  from: Position, 
  checkForCheck: boolean = true,
  enPassantTarget?: Position
): Move[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  let moves: Move[] = [];

  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(board, from, enPassantTarget);
      break;
    case 'rook':
      moves = getRookMoves(board, from);
      break;
    case 'knight':
      moves = getKnightMoves(board, from);
      break;
    case 'bishop':
      moves = getBishopMoves(board, from);
      break;
    case 'queen':
      moves = getQueenMoves(board, from);
      break;
    case 'king':
      moves = getKingMoves(board, from, checkForCheck);
      break;
  }

  // Filter out moves that would put own king in check
  if (checkForCheck) {
    moves = moves.filter(move => {
      const testBoard = makeMove(copyBoard(board), move);
      return !isInCheck(testBoard, piece.color);
    });
  }

  return moves;
}

function getPawnMoves(board: Board, from: Position, enPassantTarget?: Position): Move[] {
  const moves: Move[] = [];
  const piece = board[from.row][from.col]!;
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;

  // Forward move
  const forwardPos = { row: from.row + direction, col: from.col };
  if (isValidPosition(forwardPos) && !board[forwardPos.row][forwardPos.col]) {
    moves.push({
      from,
      to: forwardPos,
      piece,
    });

    // Double forward move from starting position
    if (from.row === startRow) {
      const doubleForwardPos = { row: from.row + 2 * direction, col: from.col };
      if (isValidPosition(doubleForwardPos) && !board[doubleForwardPos.row][doubleForwardPos.col]) {
        moves.push({
          from,
          to: doubleForwardPos,
          piece,
        });
      }
    }
  }

  // Diagonal captures
  const capturePositions = [
    { row: from.row + direction, col: from.col - 1 },
    { row: from.row + direction, col: from.col + 1 },
  ];

  capturePositions.forEach(pos => {
    if (isValidPosition(pos)) {
      const targetPiece = board[pos.row][pos.col];
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push({
          from,
          to: pos,
          piece,
          capturedPiece: targetPiece,
        });
      }
    }
  });

  // En passant
  if (enPassantTarget) {
    const enPassantRow = from.row + direction;
    if (enPassantTarget.row === enPassantRow && 
        Math.abs(enPassantTarget.col - from.col) === 1) {
      const capturedPiece = board[from.row][enPassantTarget.col];
      if (capturedPiece && capturedPiece.type === 'pawn' && capturedPiece.color !== piece.color) {
        moves.push({
          from,
          to: enPassantTarget,
          piece,
          capturedPiece,
          isEnPassant: true,
        });
      }
    }
  }

  return moves;
}

function getRookMoves(board: Board, from: Position): Move[] {
  const moves: Move[] = [];
  const piece = board[from.row][from.col]!;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  directions.forEach(([dRow, dCol]) => {
    for (let i = 1; i < 8; i++) {
      const pos = { row: from.row + i * dRow, col: from.col + i * dCol };
      if (!isValidPosition(pos)) break;

      const targetPiece = board[pos.row][pos.col];
      if (!targetPiece) {
        moves.push({ from, to: pos, piece });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ from, to: pos, piece, capturedPiece: targetPiece });
        }
        break;
      }
    }
  });

  return moves;
}

function getKnightMoves(board: Board, from: Position): Move[] {
  const moves: Move[] = [];
  const piece = board[from.row][from.col]!;
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];

  knightMoves.forEach(([dRow, dCol]) => {
    const pos = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(pos)) {
      const targetPiece = board[pos.row][pos.col];
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push({
          from,
          to: pos,
          piece,
          capturedPiece: targetPiece || undefined,
        });
      }
    }
  });

  return moves;
}

function getBishopMoves(board: Board, from: Position): Move[] {
  const moves: Move[] = [];
  const piece = board[from.row][from.col]!;
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  directions.forEach(([dRow, dCol]) => {
    for (let i = 1; i < 8; i++) {
      const pos = { row: from.row + i * dRow, col: from.col + i * dCol };
      if (!isValidPosition(pos)) break;

      const targetPiece = board[pos.row][pos.col];
      if (!targetPiece) {
        moves.push({ from, to: pos, piece });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ from, to: pos, piece, capturedPiece: targetPiece });
        }
        break;
      }
    }
  });

  return moves;
}

function getQueenMoves(board: Board, from: Position): Move[] {
  return [...getRookMoves(board, from), ...getBishopMoves(board, from)];
}

function getKingMoves(board: Board, from: Position, allowCastling: boolean = true): Move[] {
  const moves: Move[] = [];
  const piece = board[from.row][from.col]!;
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  directions.forEach(([dRow, dCol]) => {
    const pos = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(pos)) {
      const targetPiece = board[pos.row][pos.col];
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push({
          from,
          to: pos,
          piece,
          capturedPiece: targetPiece || undefined,
        });
      }
    }
  });

  // Castling - only check when allowCastling is true (prevents infinite recursion)
  if (allowCastling && !piece.hasMoved && !isInCheck(board, piece.color)) {
    const row = piece.color === 'white' ? 7 : 0;
    
    // Kingside castling
    const kingsideRook = board[row][7];
    if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved &&
        !board[row][5] && !board[row][6]) {
      // Check if squares king passes through are not under attack
      const testBoard1 = copyBoard(board);
      testBoard1[row][5] = piece;
      testBoard1[row][4] = null;
      const testBoard2 = copyBoard(board);
      testBoard2[row][6] = piece;
      testBoard2[row][4] = null;
      
      if (!isInCheck(testBoard1, piece.color) && !isInCheck(testBoard2, piece.color)) {
        moves.push({
          from,
          to: { row, col: 6 },
          piece,
          isCastling: true,
        });
      }
    }

    // Queenside castling
    const queensideRook = board[row][0];
    if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved &&
        !board[row][1] && !board[row][2] && !board[row][3]) {
      // Check if squares king passes through are not under attack
      const testBoard1 = copyBoard(board);
      testBoard1[row][3] = piece;
      testBoard1[row][4] = null;
      const testBoard2 = copyBoard(board);
      testBoard2[row][2] = piece;
      testBoard2[row][4] = null;
      
      if (!isInCheck(testBoard1, piece.color) && !isInCheck(testBoard2, piece.color)) {
        moves.push({
          from,
          to: { row, col: 2 },
          piece,
          isCastling: true,
        });
      }
    }
  }

  return moves;
}

export function makeMove(board: Board, move: Move): Board {
  const newBoard = copyBoard(board);
  
  // Handle en passant capture
  if (move.isEnPassant) {
    newBoard[move.from.row][move.to.col] = null;
  }
  
  // Handle castling
  if (move.isCastling) {
    const row = move.from.row;
    const isKingside = move.to.col === 6;
    
    if (isKingside) {
      // Move rook
      newBoard[row][5] = newBoard[row][7];
      newBoard[row][7] = null;
      if (newBoard[row][5]) newBoard[row][5].hasMoved = true;
    } else {
      // Move rook
      newBoard[row][3] = newBoard[row][0];
      newBoard[row][0] = null;
      if (newBoard[row][3]) newBoard[row][3].hasMoved = true;
    }
  }
  
  // Move the piece
  newBoard[move.to.row][move.to.col] = { ...move.piece, hasMoved: true };
  newBoard[move.from.row][move.from.col] = null;
  
  // Handle pawn promotion
  if (move.promotionPiece) {
    newBoard[move.to.row][move.to.col]!.type = move.promotionPiece;
  }
  
  return newBoard;
}

export function isCheckmate(board: Board, color: PieceColor, enPassantTarget?: Position): boolean {
  if (!isInCheck(board, color)) return false;
  
  // Check if any piece can make a legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getPossibleMoves(board, { row, col }, true, enPassantTarget);
        if (moves.length > 0) return false;
      }
    }
  }
  
  return true;
}

export function isStalemate(board: Board, color: PieceColor, enPassantTarget?: Position): boolean {
  if (isInCheck(board, color)) return false;
  
  // Check if any piece can make a legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getPossibleMoves(board, { row, col }, true, enPassantTarget);
        if (moves.length > 0) return false;
      }
    }
  }
  
  return true;
}

export function calculateScore(board: Board, color: PieceColor): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        score += PIECE_VALUES[piece.type];
      }
    }
  }
  return score;
}

export function getPieceSymbol(piece: ChessPiece): string {
  const symbols = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
  };
  
  return symbols[piece.color][piece.type];
}