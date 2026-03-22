'use client';

import { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface LoginFormProps {
    onLogin: (username: string, password?: string) => void;
    isLoading?: boolean;
}

export function LoginForm({ onLogin, isLoading }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username, password);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto p-6 glass-container">
            <h2 className="text-2xl font-bold text-game-teal mb-6 text-center drop-shadow-sm">
                Player Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-game-cyan opacity-50" />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-game-teal transition-all placeholder:text-white/20"
                        placeholder="Username"
                        required
                        autoComplete="username"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-game-orange opacity-50" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-game-teal transition-all placeholder:text-white/20"
                        placeholder="Password (optional)"
                        autoComplete="current-password"
                    />
                </div>

                <div className="flex items-center gap-2 px-1">
                    <input
                        type="checkbox"
                        id="newUser"
                        checked={isNewUser}
                        onChange={(e) => setIsNewUser(e.target.checked)}
                        className="w-4 h-4 accent-game-teal"
                    />
                    <label htmlFor="newUser" className="text-xs text-white/50 cursor-pointer hover:text-white/80 transition-colors">
                        Register as new player
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !username}
                    className="w-full bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_5px_15px_rgba(78,204,163,0.3)]"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {isNewUser ? 'Create New Account' : 'Login & Play'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            {!isNewUser ? (
                <p className="mt-4 text-center text-xs text-white/40">
                    Don't have an account? <button onClick={() => setIsNewUser(true)} className="text-game-teal hover:underline focus:outline-none">Register here</button>
                </p>
            ) : (
                <p className="mt-4 text-center text-xs text-white/40">
                    Already have an account? <button onClick={() => setIsNewUser(false)} className="text-game-teal hover:underline focus:outline-none">Login instead</button>
                </p>
            )}
        </div>
    );
}
