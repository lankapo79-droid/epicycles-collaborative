'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#e39a3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Simple epicycles demo
      if (points.length > 10) {
        const t = Date.now() / 1000;
        const n = 5;
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        ctx.strokeStyle = '#14110e';
        for (let i = 0; i < n; i++) {
          const freq = i + 1;
          const radius = 50 / (i + 1);
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();
          x += radius * Math.cos(freq * t);
          y += radius * Math.sin(freq * t);
        }
        ctx.fillStyle = '#e39a3c';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animationId);
  }, [points]);

  const handleMouseDown = (e) => {
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setPoints(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setPoints(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const handleMouseUp = () => setDrawing(false);

  return (
    <div style={{ background: '#f4efe6', height: '100vh', overflow: 'hidden' }}>
      <h1 style={{ position: 'absolute', top: 20, left: 20, color: '#14110e', zIndex: 10 }}>
        Epicycles Collaborative 💛
      </h1>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: 'crosshair' }}
      />
    </div>
  );
}