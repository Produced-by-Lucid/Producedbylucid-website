'use client';

import { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  phase: number;
  mouseAttraction: number; // Actually repulsion - different avoidance speeds for lazy effect
}

export default function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, initialized: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let blobs: Blob[] = [];

    // Mouse tracking relative to canvas position
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        initialized: true
      };
    };

    const resizeCanvas = () => {
      // Calculate 120vw in pixels
      const displayWidth = window.innerWidth * 1.2;
      // Get full height of parent container (scrolling content)
      const displayHeight = canvas.parentElement?.scrollHeight || window.innerHeight * 4;
      
      // Set canvas internal resolution to match display size
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // Also set CSS size to match (prevent squishing)
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
    };

    const initBlobs = () => {
      const effectiveWidth = canvas.width * 0.833; // Adjust for 120vw (1/1.2)
      const centerOffset = (canvas.width - effectiveWidth) / 2;
      
      blobs = [
        {
          x: centerOffset + effectiveWidth * 0.2,
          y: canvas.height * 0.15,
          vx: 0,
          vy: 0,
          radius: 280,
          baseRadius: 280,
          color: '#19532B',
          phase: 0,
          mouseAttraction: 0.002 // Increased for avoidance
        },
        {
          x: centerOffset + effectiveWidth * 0.85,
          y: canvas.height * 0.35,
          vx: 0,
          vy: 0,
          radius: 300,
          baseRadius: 300,
          color: '#D95B25',
          phase: Math.PI / 2,
          mouseAttraction: 0.003 // Increased for avoidance
        },
        {
          x: centerOffset + effectiveWidth * 0.5,
          y: canvas.height * 0.6,
          vx: 0,
          vy: 0,
          radius: 250,
          baseRadius: 250,
          color: '#0A1F14',
          phase: Math.PI,
          mouseAttraction: 0.0015 // Increased for avoidance
        },
        {
          x: centerOffset + effectiveWidth * 0.15,
          y: canvas.height * 0.85,
          vx: 0,
          vy: 0,
          radius: 220,
          baseRadius: 220,
          color: '#19532B',
          phase: Math.PI * 1.5,
          mouseAttraction: 0.0025 // Increased for avoidance
        }
      ];
    };

    const drawBlob = (blob: Blob, time: number) => {
      const segments = 12;
      const angleStep = (Math.PI * 2) / segments;
      
      ctx.beginPath();
      
      for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep;
        const nextAngle = (i + 1) * angleStep;
        
        // Create organic variation using sine waves
        const variation = Math.sin(time * 0.001 + angle * 3 + blob.phase) * 30 + 
                         Math.cos(time * 0.0015 + angle * 2) * 20;
        const nextVariation = Math.sin(time * 0.001 + nextAngle * 3 + blob.phase) * 30 + 
                             Math.cos(time * 0.0015 + nextAngle * 2) * 20;
        
        const r = blob.radius + variation;
        const nextR = blob.radius + nextVariation;
        
        const x = blob.x + Math.cos(angle) * r;
        const y = blob.y + Math.sin(angle) * r;
        const nextX = blob.x + Math.cos(nextAngle) * nextR;
        const nextY = blob.y + Math.sin(nextAngle) * nextR;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use quadratic curves for smooth organic shapes
          const cpX = blob.x + Math.cos(angle) * (r + nextR) / 2;
          const cpY = blob.y + Math.sin(angle) * (r + nextR) / 2;
          ctx.quadraticCurveTo(cpX, cpY, nextX, nextY);
        }
      }
      
      ctx.closePath();
      ctx.fillStyle = blob.color;
      ctx.fill();
    };

    const checkCollision = (blob1: Blob, blob2: Blob) => {
      const dx = blob2.x - blob1.x;
      const dy = blob2.y - blob1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = blob1.radius + blob2.radius;
      
      return distance < minDistance;
    };

    const handleCollision = (blob1: Blob, blob2: Blob) => {
      const dx = blob2.x - blob1.x;
      const dy = blob2.y - blob1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return; // Avoid division by zero
      
      // Normalize collision vector
      const nx = dx / distance;
      const ny = dy / distance;
      
      // Relative velocity
      const dvx = blob2.vx - blob1.vx;
      const dvy = blob2.vy - blob1.vy;
      
      // Relative velocity in collision normal direction
      const dvn = dvx * nx + dvy * ny;
      
      // Do not resolve if velocities are separating
      if (dvn > 0) return;
      
      // Bounce with damping
      const bounce = 0.5;
      const impulse = (2 * dvn) / 2 * bounce;
      
      blob1.vx += impulse * nx;
      blob1.vy += impulse * ny;
      blob2.vx -= impulse * nx;
      blob2.vy -= impulse * ny;
      
      // Separate overlapping blobs
      const overlap = (blob1.radius + blob2.radius - distance) / 2;
      blob1.x -= overlap * nx;
      blob1.y -= overlap * ny;
      blob2.x += overlap * nx;
      blob2.y += overlap * ny;
    };

    const updateBlob = (blob: Blob, time: number) => {
      // Lazy mouse avoidance effect
      if (mouseRef.current.initialized) {
        const dx = mouseRef.current.x - blob.x;
        const dy = mouseRef.current.y - blob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0 && distance < 500) { // Only avoid when mouse is close
          // Apply repulsion force (negative attraction = avoidance)
          blob.vx -= (dx / distance) * blob.mouseAttraction * (500 - distance) * 0.1;
          blob.vy -= (dy / distance) * blob.mouseAttraction * (500 - distance) * 0.1;
        }
      }
      
      // Add smooth floating motion
      blob.vx += Math.sin(time * 0.0005 + blob.phase) * 0.05;
      blob.vy += Math.cos(time * 0.0006 + blob.phase) * 0.05;
      
      // Apply friction/damping
      blob.vx *= 0.98;
      blob.vy *= 0.98;
      
      // Update position
      blob.x += blob.vx;
      blob.y += blob.vy;
      
      // Pulsing size variation
      blob.radius = blob.baseRadius + Math.sin(time * 0.0008 + blob.phase) * 30;
      
      // Boundary constraints with bounce
      const margin = blob.radius;
      if (blob.x < margin) {
        blob.x = margin;
        blob.vx *= -0.5;
      }
      if (blob.x > canvas.width - margin) {
        blob.x = canvas.width - margin;
        blob.vx *= -0.5;
      }
      if (blob.y < margin) {
        blob.y = margin;
        blob.vy *= -0.5;
      }
      if (blob.y > canvas.height - margin) {
        blob.y = canvas.height - margin;
        blob.vy *= -0.5;
      }
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update all blobs
      blobs.forEach(blob => {
        updateBlob(blob, time);
      });
      
      // Check collisions between all blob pairs
      for (let i = 0; i < blobs.length; i++) {
        for (let j = i + 1; j < blobs.length; j++) {
          if (checkCollision(blobs[i], blobs[j])) {
            handleCollision(blobs[i], blobs[j]);
          }
        }
      }
      
      // Apply heavy blur filter
      ctx.filter = 'blur(85px)';
      ctx.globalAlpha = 0.7;
      
      // Draw all blobs
      blobs.forEach(blob => {
        drawBlob(blob, time);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initBlobs();
    animate(0);

    // Resize again after a short delay to ensure parent is fully rendered
    setTimeout(() => {
      resizeCanvas();
      initBlobs();
    }, 100);

    const handleResize = () => {
      resizeCanvas();
      setTimeout(() => {
        resizeCanvas();
        initBlobs();
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ 
        imageRendering: 'auto'
      }}
    />
  );
}
