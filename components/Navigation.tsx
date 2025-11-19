import React, { useEffect, useRef, useState } from 'react';

interface Position {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
}

const Navigation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPos, setCurrentPos] = useState<Position | null>(null);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track position
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError("GPS not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed
        };

        if (!startPos) {
          setStartPos(newPos);
        }
        setCurrentPos(newPos);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError("GPS Signal Lost");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [startPos]);

  // Draw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Dynamic Grid Background (Simulate movement)
      // Calculate delta from start to shift grid
      let offsetX = 0;
      let offsetY = 0;
      
      if (currentPos && startPos) {
        // Arbitrary scale for visualization: 1 degree ~ 111km. 
        // We magnify tiny movements for the grid effect.
        const scale = 100000; 
        offsetX = (currentPos.lng - startPos.lng) * scale;
        offsetY = (startPos.lat - currentPos.lat) * scale; // Invert lat for Y axis
      }

      ctx.save();
      // Create a grid pattern that moves
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      
      const gridSize = 40;
      // Shift the starting point of the loop by the offset modulo gridSize
      const shiftX = offsetX % gridSize;
      const shiftY = offsetY % gridSize;

      for (let x = -gridSize + shiftX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = -gridSize + shiftY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw Route Path (Simulated relative to "World")
      // For this demo, we keep a static neon path to represent a "planned route"
      // In a full app, this would transform based on offset
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.3)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(140 - offsetX, 280 - offsetY); // Start relative to movement
      ctx.lineTo(140 - offsetX, 140 - offsetY);
      ctx.lineTo(200 - offsetX, 80 - offsetY);
      ctx.stroke();


      // 3. Current Position Marker (Always Center)
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Rotate based on heading if available
      const rotation = currentPos?.heading ? (currentPos.heading * Math.PI) / 180 : 0;
      ctx.rotate(rotation);

      // Draw Arrow
      ctx.fillStyle = '#00f3ff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f3ff';
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(10, 15);
      ctx.lineTo(0, 10);
      ctx.lineTo(-10, 15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      // 4. Pulse Effect around marker
      const time = Date.now() / 500;
      const radius = 20 + Math.sin(time) * 5;
      ctx.strokeStyle = `rgba(0, 243, 255, ${0.3 + Math.sin(time) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const animationId = requestAnimationFrame(function loop() {
      draw();
      requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(animationId);
  }, [currentPos, startPos]);

  return (
    <div className="w-full h-full relative bg-gray-900 overflow-hidden flex flex-col items-center">
      <canvas ref={canvasRef} width={320} height={320} className="absolute top-0 left-0" />
      
      {/* Top Status Bar */}
      <div className="absolute top-0 w-full p-2 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
         <span className="text-[10px] font-mono text-neon-green animate-pulse">
            {error ? 'SEARCHING...' : '● GPS ACTIVE'}
         </span>
         <span className="text-[10px] font-mono text-white">
            {currentPos?.speed ? (currentPos.speed * 3.6).toFixed(1) : '0.0'} km/h
         </span>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-8 w-[85%] bg-black/70 backdrop-blur-md p-3 rounded-xl border border-gray-700 text-center z-10">
        {error ? (
           <div className="text-red-400 text-xs">{error}</div>
        ) : (
          <>
            <div className="text-neon-blue font-tech text-lg tracking-wider">
               {currentPos ? (
                 `${currentPos.lat.toFixed(4)}, ${currentPos.lng.toFixed(4)}`
               ) : "Acquiring Satellites..."}
            </div>
            <div className="text-gray-400 text-[10px] uppercase mt-1">
               Current Location
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navigation;