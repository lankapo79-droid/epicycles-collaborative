'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export default function Home() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [epicycles, setEpicycles] = useState([]);
  const [numCircles, setNumCircles] = useState(20);
  const [speed, setSpeed] = useState(1);
  const timeRef = useRef(0);

  // Discrete Fourier Transform
  const dft = useCallback((x) => {
    const N = x.length;
    const X = [];
    for (let k = 0; k < N; k++) {
      let re = 0;
      let im = 0;
      for (let n = 0; n < N; n++) {
        const phi = (2 * Math.PI * k * n) / N;
        re += x[n].x * Math.cos(phi) + x[n].y * Math.sin(phi);
        im += -x[n].x * Math.sin(phi) + x[n].y * Math.cos(phi);
      }
      re /= N;
      im /= N;
      const freq = k;
      const amp = Math.sqrt(re * re + im * im);
      const phase = Math.atan2(im, re);
      X[k] = { re, im, freq, amp, phase };
    }
    return X.sort((a, b) => b.amp - a.amp);
  }, []);

  useEffect(() => {
    if (points.length > 10) {
      const fourier = dft(points);
      setEpicycles(fourier.slice(0, numCircles));
    }
  }, [points, numCircles, dft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f4efe6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw original path
      if (points.length > 1) {
        ctx.strokeStyle = 'rgba(227, 154, 60, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }

      // Draw epicycles
      if (epicycles.length > 0) {
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        ctx.strokeStyle = '#14110e';
        ctx.lineWidth = 1.5;

        for (let i = 0; i < epicycles.length; i++) {
          const prevX = x;
          const prevY = y;
          const epi = epicycles[i];
          const radius = epi.amp;
          const angle = epi.freq * timeRef.current + epi.phase;

          ctx.beginPath();
          ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
          ctx.stroke();

          x += radius * Math.cos(angle);
          y += radius * Math.sin(angle);

          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Drawing point
        ctx.fillStyle = '#e39a3c';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      timeRef.current += 0.02 * speed;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animationId);
  }, [points, epicycles, speed]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    setDrawing(true);
    setPoints([getPos(e)]);
    timeRef.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    setPoints(prev => [...prev, getPos(e)]);
  };

  const handleMouseUp = () => setDrawing(false);

  const clearCanvas = () => {
    setPoints([]);
    setEpicycles([]);
    timeRef.current = 0;
  };

  return (
    <div style={{ background: '#f4efe6', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui' }}>
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, color: '#14110e' }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Epicycles Collaborative</h1>
        <p style={{ margin: '4px 0 12px', opacity: 0.7, fontSize: 14 }}>Draw a shape, then watch the circles recreate it</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Circles: {numCircles}
            <input type="range" min="5" max="80" value={numCircles} onChange={e => setNumCircles(+e.target.value)} />
          </label>
          <label>Speed: {speed.toFixed(1)}x
            <input type="range" min="0.2" max="3" step="0.1" value={speed} onChange={e => setSpeed(+e.target.value)} />
          </label>
          <button onClick={clearCanvas} style={{ padding: '6px 12px', background: '#e39a3c', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#14110e', fontWeight: 600 }}>
            Clear
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: 'crosshair', display: 'block' }}
      />
    </div>
  );
}