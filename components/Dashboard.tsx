
import React from 'react';
import { RideData } from '../types';

interface DashboardProps {
  rideData: RideData;
  batteryLevel: number;
  speedLimit: number;
}

const Dashboard: React.FC<DashboardProps> = ({ rideData, batteryLevel, speedLimit }) => {
  const speedPercentage = Math.min((rideData.currentSpeed / 40) * 100, 100); // Cap at 40km/h for visuals
  const isOverSpeed = rideData.currentSpeed > speedLimit;

  return (
    <div className="flex flex-col items-center justify-center h-full relative p-4">
      {/* Top Battery & Time */}
      <div className="absolute top-8 flex justify-between w-full px-8 text-xs text-gray-400 font-mono">
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className={batteryLevel < 20 ? 'text-neon-red' : 'text-neon-green'}>
          {batteryLevel}% ⚡
        </span>
      </div>

      {/* Speedometer Graphic */}
      <div className="relative w-48 h-48 flex items-center justify-center mt-4">
        {/* Outer Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="#1f2937"
            strokeWidth="12"
            fill="none"
          />
          {/* Speed Progress */}
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={502} // 2 * pi * 80
            strokeDashoffset={502 - (502 * speedPercentage) / 100}
            className={`${isOverSpeed ? 'text-neon-red animate-pulse' : 'text-neon-blue'} transition-all duration-500 ease-out`}
            strokeLinecap="round"
          />
          {/* Speed Limit Marker (Visual Guide) */}
          <circle 
             cx="96" 
             cy="96" 
             r="80" 
             stroke="rgba(255, 50, 50, 0.5)" 
             strokeWidth="4" 
             fill="none"
             strokeDasharray="2 500"
             strokeDashoffset={502 - (502 * Math.min((speedLimit / 40) * 100, 100)) / 100}
             className="transform rotate-90" // Adjust rotation if needed, simplistic marker
          />
        </svg>
        
        {/* Inner Speed Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-6xl font-bold font-tech tracking-tighter ${isOverSpeed ? 'text-neon-red' : 'text-white'}`}>
            {rideData.currentSpeed.toFixed(1)}
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 mt-1">km/h</span>
          {isOverSpeed && (
             <span className="absolute -bottom-2 text-[10px] font-bold bg-neon-red text-black px-2 py-0.5 rounded animate-bounce">SLOW DOWN</span>
          )}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex justify-between w-full px-6 mt-2">
        <div className="text-center">
          <p className="text-[10px] uppercase text-gray-500">Dist</p>
          <p className="text-lg font-tech font-medium text-white">{rideData.distance.toFixed(1)}<span className="text-xs">km</span></p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase text-gray-500">Time</p>
          <p className="text-lg font-tech font-medium text-white">
            {Math.floor(rideData.duration / 60)}:<span className="text-base">{String(rideData.duration % 60).padStart(2, '0')}</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase text-gray-500">Cal</p>
          <p className="text-lg font-tech font-medium text-white">{Math.floor(rideData.calories)}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
