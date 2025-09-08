import { PieceColor } from '../utils/chess-logic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface WinnerModalProps {
  isOpen: boolean;
  winner: PieceColor | 'draw' | null;
  winReason: string;
  whiteScore: number;
  blackScore: number;
  onNewGame: () => void;
}

export function WinnerModal({ 
  isOpen, 
  winner, 
  winReason, 
  whiteScore, 
  blackScore, 
  onNewGame 
}: WinnerModalProps) {
  const getWinnerTitle = () => {
    if (winner === 'draw') return '🤝 Game Draw!';
    if (winner === 'white') return '👑 White Wins!';
    if (winner === 'black') return '👑 Black Wins!';
    return 'Game Over';
  };

  const getWinnerEmoji = () => {
    if (winner === 'draw') return '🤝';
    return '🎉';
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {getWinnerTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Celebration Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center"
          >
            <div className="text-6xl mb-4">
              {getWinnerEmoji()}
            </div>
          </motion.div>

          {/* Win Reason */}
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">{winReason}</p>
          </div>

          {/* Final Scores */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-center mb-3">Final Scores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`text-center p-3 rounded-lg ${winner === 'white' ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100'}`}>
                <div className="font-semibold">White</div>
                <div className="text-xl">{whiteScore}</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${winner === 'black' ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100'}`}>
                <div className="font-semibold">Black</div>
                <div className="text-xl">{blackScore}</div>
              </div>
            </div>
          </div>

          {/* Confetti Animation */}
          {winner !== 'draw' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 400,
                    y: -20,
                    rotate: 0,
                    scale: 0
                  }}
                  animate={{ 
                    y: 400,
                    rotate: 360,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 3,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 5
                  }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded"
                  style={{
                    backgroundColor: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed', '#059669'][i % 5]
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* New Game Button */}
          <div className="text-center">
            <Button
              onClick={onNewGame}
              className="w-full"
              size="lg"
            >
              Start New Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}