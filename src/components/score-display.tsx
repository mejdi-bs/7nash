'use client';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
}

export function ScoreDisplay({ score, highScore }: ScoreDisplayProps) {
  return (
    <div className="flex justify-center gap-8 mb-5">
      <div className="bg-gradient-to-br from-[#232931] to-[#393e46] px-6 py-2.5 rounded-lg text-white text-xl font-bold">
        Score: <span className="text-game-teal">{score}</span>
      </div>
      <div className="bg-gradient-to-br from-[#232931] to-[#393e46] px-6 py-2.5 rounded-lg text-white text-xl font-bold">
        Best: <span className="text-game-teal">{highScore}</span>
      </div>
    </div>
  );
}
