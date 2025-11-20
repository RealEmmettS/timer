'use client';

import React, { useEffect, useRef } from 'react';

export default function InteractiveGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -1;
    let mouseY = -1;
    
    // Grid configuration
    const spacing = 40;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      if (!canvas || !ctx) return;
      
      // Get colors from CSS variables for dynamic theme support
      const style = getComputedStyle(document.body);
      const colorForeground = style.getPropertyValue('--foreground').trim() || '#000';
      const colorAccent = style.getPropertyValue('--bauhaus-blue').trim() || '#2D5BFF'; // Use blue for neutral hover
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid Lines
      ctx.strokeStyle = colorForeground;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.05;
      
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += spacing) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvas.height);
      }
      for (let y = 0; y <= canvas.height; y += spacing) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvas.width, y + 0.5);
      }
      ctx.stroke();
      
      // Highlight cell under mouse
      if (mouseX >= 0 && mouseY >= 0) {
        const cellX = Math.floor(mouseX / spacing) * spacing;
        const cellY = Math.floor(mouseY / spacing) * spacing;
        
        // Fill
        ctx.fillStyle = colorAccent;
        ctx.globalAlpha = 0.1;
        ctx.fillRect(cellX, cellY, spacing, spacing);
        
        // Border
        ctx.strokeStyle = colorAccent;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.strokeRect(cellX, cellY, spacing, spacing);
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1;
      mouseY = -1;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);
    
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ touchAction: 'none' }}
    />
  );
}

