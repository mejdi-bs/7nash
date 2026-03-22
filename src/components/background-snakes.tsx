'use client';

import { useEffect, useRef } from 'react';
import { SNAKE_SKINS } from '@/lib/game/skins';
import { GRID_SIZE } from '@/lib/game/constants';

interface GhostSnake {
    x: number;
    y: number;
    segments: { x: number; y: number }[];
    skinIndex: number;
    speed: number;
    wiggleOffset: number;
    direction: 1 | -1;
    length: number;
    name: string;
    rank?: number; // 1, 2, or 3
}

const DEFAULT_CHAMPIONS = [
    { name: 'SlitherKing', skinId: 'gold' },
    { name: 'NeonMamba', skinId: 'purple' },
    { name: 'CobraCommander', skinId: 'rainbow' }
];

const SNAKE_NAMES = [
    'PythonPro', 'ViperX', 'Chahine', 'Slytherin', 'Scales',
    'ColdBlood', 'FangForce', 'AspExpert', 'GarterGo', 'CopperHead'
];

interface BackgroundSnakesProps {
    topPlayers?: Array<{ name: string; highScore: number; skinId: string }>;
}

export function BackgroundSnakes({ topPlayers = [] }: BackgroundSnakesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const snakesRef = useRef<GhostSnake[]>([]);

    useEffect(() => {
        const skinsCount = SNAKE_SKINS.length;

        // Always ensure we have 3 "Champions" to show, using defaults if list is empty
        const champions = [...topPlayers];
        while (champions.length < 3) {
            champions.push({
                name: DEFAULT_CHAMPIONS[champions.length].name,
                highScore: 0,
                skinId: DEFAULT_CHAMPIONS[champions.length].skinId
            });
        }

        // Initialize ghost snakes
        snakesRef.current = Array.from({ length: 15 }).map((_, i) => {
            const length = 10 + Math.floor(Math.random() * 15);
            const direction = Math.random() > 0.5 ? 1 : -1;

            // Assign champions to the first 3 snakes
            const isChampion = i < 3;
            const playerName = isChampion ? champions[i].name : SNAKE_NAMES[i % SNAKE_NAMES.length];
            const skinId = isChampion ? champions[i].skinId : SNAKE_SKINS[i % skinsCount].id;
            const skinIndex = SNAKE_SKINS.findIndex(s => s.id === skinId);

            return {
                x: direction === 1 ? -20 - Math.random() * 40 : 60 + Math.random() * 40,
                y: Math.random() * 50,
                segments: Array.from({ length }).map(() => ({ x: 0, y: 0 })),
                skinIndex: skinIndex >= 0 ? skinIndex : 0,
                speed: (isChampion ? 0.08 + Math.random() * 0.04 : 0.04 + Math.random() * 0.12) * direction,
                wiggleOffset: Math.random() * Math.PI * 2,
                direction: direction as 1 | -1,
                length,
                name: playerName,
                rank: isChampion ? i + 1 : undefined
            };
        });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const render = (time: number) => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            snakesRef.current.forEach((snake) => {
                snake.x += snake.speed;
                const margin = 30;
                const maxX = (canvas.width / GRID_SIZE) + margin;
                if (snake.speed > 0 && snake.x > maxX) {
                    snake.x = -margin;
                    snake.y = Math.random() * (canvas.height / GRID_SIZE);
                } else if (snake.speed < 0 && snake.x < -margin) {
                    snake.x = maxX;
                    snake.y = Math.random() * (canvas.height / GRID_SIZE);
                }

                const skin = SNAKE_SKINS[snake.skinIndex];
                const isTop = !!snake.rank;

                // Champions are much more visible
                ctx.globalAlpha = isTop ? 0.6 : 0.2;

                snake.segments.forEach((seg, i) => {
                    const targetX = snake.x - (i * 0.8 * (snake.speed > 0 ? 1 : -1));
                    const targetY = snake.y + Math.sin(time / 400 + i * 0.4 + snake.wiggleOffset) * 0.6;

                    seg.x = targetX;
                    seg.y = targetY;

                    const size = GRID_SIZE * 0.9; // Slightly bigger segments for visibility
                    const rx = seg.x * GRID_SIZE;
                    const ry = seg.y * GRID_SIZE;

                    if (isTop && i === 0) {
                        ctx.shadowColor = skin.headColor;
                        ctx.shadowBlur = 20;
                    }

                    ctx.fillStyle = i === 0 ? skin.headColor : skin.bodyColor(i);
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(rx, ry, size, size, isTop ? 10 : 6);
                    else ctx.rect(rx, ry, size, size);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    if (i === 0) {
                        // Eyes
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        const eyeOffset = snake.speed > 0 ? size * 0.7 : size * 0.2;
                        ctx.beginPath();
                        ctx.arc(rx + eyeOffset, ry + size * 0.3, 2.5, 0, Math.PI * 2);
                        ctx.arc(rx + eyeOffset, ry + size * 0.7, 2.5, 0, Math.PI * 2);
                        ctx.fill();

                        // Labels removed per user request
                    }
                });
            });

            animationId = requestAnimationFrame(render);
        };

        animationId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationId);
    }, [topPlayers]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{
                filter: 'blur(0.3px)',
                opacity: 0.8
            }}
        />
    );
}
