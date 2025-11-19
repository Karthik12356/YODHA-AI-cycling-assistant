import React, { useEffect, useRef } from 'react';

const Navigation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw a simulated route
    const drawMap = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background grid
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        for(let i=0; i<canvas.width; i+=20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Route Path
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#39ff14';
        
        ctx.beginPath();
        ctx.moveTo(50, 250);
        ctx.lineTo(100, 200);
        ctx.lineTo(120, 150); // Turn
        ctx.lineTo(180, 140);
        ctx.lineTo(220, 80); // Destination
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Current Position Arrow
        ctx.save();
        ctx.translate(100, 200);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#00f3ff';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(8, 10);
        ctx.lineTo(0, 6);
        ctx.lineTo(-8, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Destination Marker
        ctx.fillStyle = '#ff3131';
        ctx.beginPath();
        ctx.arc(220, 80, 6, 0, Math.PI * 2);
        ctx.fill();
    };

    drawMap();
  }, []);

  return (
    <div className="w-full h-full relative bg-gray-900 overflow-hidden flex flex-col items-center">
      <canvas ref={canvasRef} width={280} height={280} className="absolute top-0 left-0 opacity-80" />
      
      {/* Overlay Direction */}
      <div className="absolute bottom-8 w-3/4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-gray-700 text-center">
        <div className="text-neon-green font-bold text-xl mb-1">Turn Right</div>
        <div className="text-gray-300 text-xs">in 50 meters</div>
      </div>
    </div>
  );
};

export default Navigation;