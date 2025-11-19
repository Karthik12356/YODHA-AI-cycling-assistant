
import React from 'react';
import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  onTestFall: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onTestFall }) => {
  return (
    <div className="w-full h-full bg-black p-4 overflow-y-auto pb-20">
      <h2 className="text-xl font-tech text-neon-blue mb-4 tracking-wider border-b border-gray-800 pb-2">SETTINGS</h2>
      
      {/* Speed Limit Section */}
      <div className="mb-6">
        <label className="block text-gray-400 text-xs uppercase mb-2">Max Speed Alert</label>
        <div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-800">
           <button 
             className="w-8 h-8 bg-gray-800 rounded text-xl font-bold text-neon-blue"
             onClick={() => updateSettings({ speedLimit: Math.max(10, settings.speedLimit - 5) })}
           >-</button>
           <span className="text-2xl font-tech font-bold text-white">{settings.speedLimit} <span className="text-xs text-gray-500">km/h</span></span>
           <button 
             className="w-8 h-8 bg-gray-800 rounded text-xl font-bold text-neon-blue"
             onClick={() => updateSettings({ speedLimit: Math.min(60, settings.speedLimit + 5) })}
           >+</button>
        </div>
      </div>

      {/* Safety Section */}
      <div className="mb-6 space-y-4">
        <label className="block text-gray-400 text-xs uppercase border-b border-gray-800 pb-1">Safety</label>
        
        {/* Fall Detection Toggle */}
        <div className="flex items-center justify-between">
           <span className="text-sm text-gray-200">Fall Detection</span>
           <button 
             onClick={() => updateSettings({ enableFallDetection: !settings.enableFallDetection })}
             className={`w-12 h-6 rounded-full relative transition-colors ${settings.enableFallDetection ? 'bg-neon-green' : 'bg-gray-700'}`}
           >
             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableFallDetection ? 'left-7' : 'left-1'}`}></div>
           </button>
        </div>

        {/* Emergency Contact */}
        <div>
           <span className="text-xs text-gray-400 block mb-1">Emergency Contact</span>
           <input 
             type="tel" 
             value={settings.emergencyContact}
             onChange={(e) => updateSettings({ emergencyContact: e.target.value })}
             placeholder="+1 234 567 890"
             className="w-full bg-gray-900 text-white text-sm p-2 rounded border border-gray-700 focus:border-neon-blue outline-none"
           />
        </div>
      </div>

      {/* Test Actions */}
      <div className="mt-4">
         <button 
           onClick={onTestFall}
           className="w-full py-3 bg-red-900/30 border border-red-800 text-red-400 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-red-900/50"
         >
           Simulate Fall
         </button>
         <p className="text-[10px] text-gray-600 text-center mt-2">
            Detects abrupt stops & high-G impacts.
         </p>
      </div>
    </div>
  );
};

export default Settings;
