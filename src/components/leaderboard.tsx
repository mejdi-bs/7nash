'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { SNAKE_SKINS } from '@/lib/game/skins';

interface Player {
  username: string;
  highScore: number;
  selectedSkin: string;
}

export function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard?limit=10')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white/50 text-sm">Loading...</div>;

  const getSkinColor = (skinId: string) => {
    const skin = SNAKE_SKINS.find(s => s.id === skinId);
    return skin?.headColor || '#4ecca3';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-white/50 font-bold w-5">{rank}</span>;
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-game-teal" />
        <h3 className="text-white font-bold">Leaderboard</h3>
      </div>

      {players.length === 0 ? (
        <p className="text-white/40 text-sm">No players yet</p>
      ) : (
        <div className="space-y-2">
          {players.map((player, i) => (
            <div key={player.username} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <div className="flex items-center justify-center w-6">{getRankIcon(i + 1)}</div>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSkinColor(player.selectedSkin) }}
              />
              <span className="text-white text-sm flex-1 truncate">{player.username}</span>
              <span className="text-game-teal font-bold text-sm">{player.highScore}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
