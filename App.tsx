import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScreenMode, RideData, BatteryState, UserSettings } from './types';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Assistant from './components/Assistant';
import Settings from './components/Settings';
import { speak } from './services/voiceService';
import { generateRideAnalysis } from './services/geminiService';

// Simulated Watch Frame
const WatchFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative w-[320px] h-[320px] md:w-[380px] md:h-[380px] bg-gray-900 rounded-full border-[12px] border-gray-800 shadow-2xl overflow-hidden flex flex-col relative mx-auto mt-10">
     <div className="absolute inset-0 pointer-events-none rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] z-50"></div>
     <div className="w-full h-full bg-watch-bg text-white relative z-10">
       {children}
     </div>
     {/* Side Button Simulation */}
     <div className="absolute -right-[18px] top-1/2 transform -translate-y-1/2 w-[6px] h-12 bg-gray-600 rounded-r-md z-0"></div>
  </div>
);

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenMode>(ScreenMode.DASHBOARD);
  const [battery, setBattery] = useState<BatteryState>({ level: 85, isCharging: false });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // User Settings
  const [settings, setSettings] = useState<UserSettings>({
    speedLimit: 25,
    enableFallDetection: true,
    emergencyContact: '',
    userName: 'Rider'
  });

  // Fall Detection State
  const [fallCountdown, setFallCountdown] = useState<number | null>(null);
  const [fallAlertSent, setFallAlertSent] = useState(false);
  
  // Ride State
  const [rideData, setRideData] = useState<RideData>({
    startTime: null,
    duration: 0,
    distance: 0,
    currentSpeed: 0,
    maxSpeed: 0,
    calories: 0,
    isPaused: true
  });

  const lastSpeedAlertTime = useRef<number>(0);

  // Initialization
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Simulate Battery Drain
    const batteryInterval = setInterval(() => {
        setBattery(prev => ({ ...prev, level: Math.max(0, prev.level - 0.1) }));
    }, 10000);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(batteryInterval);
    };
  }, []);

  // Ride Logic & Speed Monitoring
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!rideData.isPaused) {
      interval = setInterval(() => {
        setRideData(prev => {
          // Simulate speed changes for demo (fluctuate between 10 and 35 km/h)
          const newSpeed = Math.max(0, Math.min(45, prev.currentSpeed + (Math.random() * 6 - 3)));
          const distanceIncrement = (newSpeed / 3600); // km per sec
          
          return {
            ...prev,
            duration: prev.duration + 1,
            distance: prev.distance + distanceIncrement,
            currentSpeed: newSpeed,
            maxSpeed: Math.max(prev.maxSpeed, newSpeed),
            calories: prev.calories + (newSpeed > 20 ? 0.15 : 0.1)
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rideData.isPaused]);

  // Check for Speed Limit Violation
  useEffect(() => {
    if (!rideData.isPaused && rideData.currentSpeed > settings.speedLimit) {
        const now = Date.now();
        // Alert only every 15 seconds to avoid spamming
        if (now - lastSpeedAlertTime.current > 15000) {
            speak(`Speed limit exceeded. Slow down to ${settings.speedLimit} kilometers per hour.`);
            lastSpeedAlertTime.current = now;
        }
    }
  }, [rideData.currentSpeed, rideData.isPaused, settings.speedLimit]);

  // Device Sensor Fall Detection (Simulated Logic for Browser)
  useEffect(() => {
      if (!settings.enableFallDetection || rideData.isPaused) return;

      const handleMotion = (event: Event) => {
          const motionEvent = event as DeviceMotionEvent;
          // Basic vector magnitude calculation
          const { x, y, z } = motionEvent.accelerationIncludingGravity || { x:0, y:0, z:0 };
          if (!x || !y || !z) return;

          const acceleration = Math.sqrt(x*x + y*y + z*z);
          
          // Threshold ~2.5G (approx 25 m/s^2) - Usually indicates impact
          if (acceleration > 25) {
              // Check if speed drops significantly (GPS/Speed sensor logic)
              // In this sim, we check if we are currently riding
               if (rideData.currentSpeed > 5) {
                  triggerFallAlert();
               }
          }
      };

      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
  }, [settings.enableFallDetection, rideData.isPaused, rideData.currentSpeed]);

  // Fall Detection Countdown Logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (fallCountdown !== null && fallCountdown > 0) {
        timer = setInterval(() => {
            setFallCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
    } else if (fallCountdown === 0 && !fallAlertSent) {
        // Timer hit 0, send alert
        setFallAlertSent(true);
        const loc = "37.7749° N, 122.4194° W"; // Mock location
        speak(`Fall detected. Sending emergency alert to ${settings.emergencyContact || "contacts"} with location.`);
        // Here we would trigger the actual SMS/API call
    }
    return () => clearInterval(timer);
  }, [fallCountdown, fallAlertSent, settings.emergencyContact]);

  const triggerFallAlert = useCallback(() => {
      if (fallCountdown !== null) return; // Already active
      setFallCountdown(10); // 10 seconds to cancel
      setFallAlertSent(false);
      speak("Fall detected. Emergency alert initiating.");
  }, [fallCountdown]);

  const cancelFallAlert = () => {
      setFallCountdown(null);
      setFallAlertSent(false);
      speak("Alert cancelled. Glad you are okay.");
  };

  // Handle Ride Start/Stop
  const toggleRide = useCallback(async () => {
    if (rideData.isPaused) {
      speak("Ride started. Stay safe.");
      setRideData(prev => ({ ...prev, isPaused: false, startTime: prev.startTime || Date.now() }));
    } else {
      speak("Ride paused.");
      setRideData(prev => ({ ...prev, isPaused: true }));
      
      if (isOnline && rideData.distance > 0.1) {
         const summary = await generateRideAnalysis(rideData);
         speak(summary); 
      }
    }
  }, [rideData, isOnline]);

  // Explicit Voice Controls
  const handleRideControl = useCallback((action: 'PAUSE' | 'RESUME') => {
    if (action === 'PAUSE' && !rideData.isPaused) {
        toggleRide();
    } else if (action === 'RESUME' && rideData.isPaused) {
        toggleRide();
    } else {
        // State matches desire, just confirm
        speak(`Ride is already ${rideData.isPaused ? 'paused' : 'active'}.`);
    }
  }, [rideData.isPaused, toggleRide]);

  // Navigation Items
  const navItems = [
    { mode: ScreenMode.MAP, icon: 'M', label: 'Map' },
    { mode: ScreenMode.DASHBOARD, icon: 'D', label: 'Dash' },
    { mode: ScreenMode.ASSISTANT, icon: 'A', label: 'Yodha' },
    { mode: ScreenMode.SETTINGS, icon: 'S', label: 'Set' },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black">
      
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold font-tech text-white tracking-widest">YODHA</h1>
        <p className="text-neon-blue text-xs uppercase tracking-widest">Offline AI Co-Pilot</p>
      </div>

      <WatchFrame>
        {/* Emergency Overlay */}
        {fallCountdown !== null && (
            <div className="absolute inset-0 z-50 bg-neon-red/90 flex flex-col items-center justify-center p-4 animate-pulse">
                <div className="text-white font-bold text-2xl mb-2">FALL DETECTED</div>
                
                {!fallAlertSent ? (
                    <>
                        <div className="text-6xl font-tech font-bold text-white mb-4">{fallCountdown}</div>
                        <div className="text-xs text-white mb-6 text-center uppercase">Sending Alert with GPS Location</div>
                        <button 
                            onClick={cancelFallAlert}
                            className="bg-white text-red-600 font-bold py-3 px-8 rounded-full text-lg shadow-lg"
                        >
                            I'M OKAY
                        </button>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="text-4xl mb-2">🚑</div>
                        <div className="font-bold text-white">ALERT SENT</div>
                        <div className="text-xs mt-2 text-white/80">Contacting {settings.emergencyContact}</div>
                        <button 
                            onClick={cancelFallAlert}
                            className="mt-6 border border-white text-white py-2 px-6 rounded-full text-sm"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* Main Content Area */}
        <div className="h-full w-full pt-2 pb-16">
          {screen === ScreenMode.DASHBOARD && (
            <Dashboard rideData={rideData} batteryLevel={Math.floor(battery.level)} speedLimit={settings.speedLimit} />
          )}
          {screen === ScreenMode.MAP && <Navigation />}
          {screen === ScreenMode.ASSISTANT && (
            <Assistant isOnline={isOnline} onRideControl={handleRideControl} />
          )}
          {screen === ScreenMode.SETTINGS && (
             <Settings 
               settings={settings} 
               updateSettings={(newS) => setSettings(prev => ({...prev, ...newS}))} 
               onTestFall={triggerFallAlert}
             />
          )}
        </div>

        {/* Bottom Nav Bar */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black to-transparent flex justify-center items-center space-x-4 z-20 pb-2">
            {navItems.map((item) => (
                <button 
                  key={item.mode}
                  onClick={() => setScreen(item.mode)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    screen === item.mode 
                        ? 'bg-neon-blue text-black shadow-[0_0_10px_#00f3ff]' 
                        : 'bg-gray-800 text-gray-400'
                  }`}
                >
                   <span className="font-tech font-bold text-sm">{item.icon}</span>
                </button>
            ))}
        </div>

        {/* Floating Action Button (Start/Stop) only on Dashboard */}
        {screen === ScreenMode.DASHBOARD && (
           <button 
             onClick={toggleRide}
             className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 z-30 transition-transform active:scale-95 ${
                !rideData.isPaused 
                ? 'bg-black border-neon-red text-neon-red' 
                : 'bg-black border-neon-green text-neon-green'
             }`}
           >
             {!rideData.isPaused ? (
                 <div className="w-4 h-4 bg-neon-red rounded-sm"></div>
             ) : (
                 <div className="w-0 h-0 border-l-[10px] border-l-neon-green border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
             )}
           </button>
        )}

      </WatchFrame>

      <div className="mt-8 text-gray-500 text-xs max-w-md text-center">
        Designed for Fire Bolt Snap • {isOnline ? <span className="text-green-500">Online</span> : <span className="text-yellow-500">Offline Mode</span>}
      </div>
    </div>
  );
};

export default App;