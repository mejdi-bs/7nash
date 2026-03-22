'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UsernameInputProps {
  username: string;
  onUsernameChange: (username: string) => void;
}

export function UsernameInput({ username, onUsernameChange }: UsernameInputProps) {
  const [isEditing, setIsEditing] = useState(!username);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleConfirm = useCallback(() => {
    const trimmed = username.trim();
    if (!trimmed) return;
    setIsEditing(false);
  }, [username]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleConfirm();
      }
    },
    [handleConfirm]
  );

  if (isEditing || !username.trim()) {
    return (
      <div className="flex justify-center gap-2 mb-3">
        <input
          ref={inputRef}
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-[#232931] text-white px-3 py-2 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-game-teal"
          placeholder="Enter your name"
          maxLength={15}
        />
        <button
          onClick={handleConfirm}
          disabled={!username.trim()}
          className="px-4 py-2 text-sm bg-game-teal text-game-dark font-medium rounded-lg hover:bg-game-teal/80 transition-colors disabled:opacity-50"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-game-cyan text-sm mb-3 hover:text-game-teal transition-colors"
    >
      Welcome, <span className="text-game-teal font-medium">{username}</span>! 👋
    </button>
  );
}
