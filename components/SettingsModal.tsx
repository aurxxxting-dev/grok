import React, { useState } from 'react';
import { Key, X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, setApiKey }) => {
  const [tempKey, setTempKey] = useState(apiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            API Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Access Token (Key)
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">
              Your key is stored locally in your browser and used to authenticate with t8star.cn.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              Save API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;