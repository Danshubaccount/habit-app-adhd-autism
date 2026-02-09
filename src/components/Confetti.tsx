import React, { useEffect, useRef } from 'react';

const Confetti: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: {
            x: number;
            y: number;
            vx: number;
            vy: number;
            color: string;
            size: number;
        }[] = [];

        const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'];

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
            });
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let activeParticles = 0;
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.5; // Gravity
                p.vx *= 0.95; // Friction

                if (p.y < canvas.height + 20) {
                    activeParticles++;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                }
            });

            if (activeParticles > 0) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9999
            }}
        />
    );
};

export default Confetti;
