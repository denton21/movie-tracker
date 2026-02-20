'use client';

import { useEffect, useRef } from 'react';

const ASCII_CHARS = ['@', '#', '$', '%', '&', '*', '+', '=', '-', '.', ' '];

export default function AsciiBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use a lower resolution canvas scaled up with CSS for a big perf win
        const SCALE = 2; // render at half resolution
        const fontSize = 14;

        const resizeCanvas = () => {
            canvas.width = Math.floor(window.innerWidth / SCALE);
            canvas.height = Math.floor(window.innerHeight / SCALE);
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const columns = Math.floor(canvas.width / (fontSize * 0.6));
        const rows = Math.floor(canvas.height / fontSize);

        const grid: { char: string; opacity: number; targetOpacity: number }[][] = [];
        for (let y = 0; y < rows; y++) {
            grid[y] = [];
            for (let x = 0; x < columns; x++) {
                grid[y][x] = {
                    char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
                    opacity: Math.random() * 0.3,
                    targetOpacity: Math.random() * 0.3,
                };
            }
        }

        // Throttle to ~20fps instead of 60fps — plenty for a background
        const TARGET_FPS = 20;
        const INTERVAL = 1000 / TARGET_FPS;
        let lastTime = 0;
        let frame = 0;
        let rafId: number;

        const animate = (now: number) => {
            rafId = requestAnimationFrame(animate);

            if (now - lastTime < INTERVAL) return;
            lastTime = now;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${fontSize}px monospace`;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < columns; x++) {
                    const cell = grid[y][x];

                    cell.opacity += (cell.targetOpacity - cell.opacity) * 0.05;

                    if (Math.random() < 0.002) {
                        cell.targetOpacity = Math.random() * 0.25;
                        cell.char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
                    }

                    const wave = Math.sin((x + y + frame * 0.02) * 0.1) * 0.08 + 0.08;
                    const finalOpacity = Math.min(cell.opacity + wave, 0.4);

                    ctx.fillStyle = `rgba(255,255,255,${finalOpacity.toFixed(2)})`;
                    ctx.fillText(cell.char, x * fontSize * 0.6, y * fontSize);
                }
            }
            frame++;
        };

        rafId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.04, width: '100vw', height: '100vh', imageRendering: 'pixelated' }}
        />
    );
}
