'use client';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
  username?: string;
}

export function ScoreDisplay({ score, highScore, username }: ScoreDisplayProps) {
  return (
    <div className="flex justify-center gap-8 mb-5">
      {username && (
        <div className="text-game-cyan text-sm mb-1">
          Welcome, <span className="text-game-teal font-medium">{username}</span>! 👋
        </div>
      )}
      <div className="bg-gradient-to-br from-[#232931] to-[#393e46] px-6 py-2.5 rounded-lg text-white text-xl font-bold">
        Score: <span className="text-game-teal">{score}</span>
      </div>
      <div className="bg-gradient-to-br from-[#232931] to-[#393e46] px-6 py-2.5 rounded-lg text-white text-xl font-bold">
        Best: <span className="text-game-teal">{highScore}</span>
      </div>
    </div>
  );
}
