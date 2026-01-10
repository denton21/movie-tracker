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

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const fontSize = 14;
        const columns = Math.floor(canvas.width / (fontSize * 0.6));
        const rows = Math.floor(canvas.height / fontSize);

        // Создаём матрицу символов
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

        let frame = 0;
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < columns; x++) {
                    const cell = grid[y][x];

                    // Плавное изменение прозрачности
                    cell.opacity += (cell.targetOpacity - cell.opacity) * 0.02;

                    // Случайно меняем цель
                    if (Math.random() < 0.001) {
                        cell.targetOpacity = Math.random() * 0.3;
                        cell.char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
                    }

                    // Волна по диагонали
                    const wave = Math.sin((x + y + frame * 0.02) * 0.1) * 0.1 + 0.1;
                    const finalOpacity = Math.min(cell.opacity + wave, 0.5);

                    ctx.fillStyle = `rgba(168, 85, 247, ${finalOpacity})`;
                    ctx.fillText(cell.char, x * fontSize * 0.6, y * fontSize);
                }
            }

            frame++;
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.5 }}
        />
    );
}
