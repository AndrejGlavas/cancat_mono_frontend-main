// components/TransactionVisibilityControls.tsx   updated 24
import React from 'react';
import { Flag, EyeOff, Lock, LockOpen, X } from "lucide-react";
import { VisibilityPreferences } from '../utils/types';



interface TransactionVisibilityControlsProps {
    visibilityPreferences: VisibilityPreferences;
    onVisibilityChange: (preferences: VisibilityPreferences) => void;
}

const TransactionVisibilityControls: React.FC<TransactionVisibilityControlsProps> = ({
    visibilityPreferences,
    onVisibilityChange
}) => {
    const handleVisibilityToggle = (key: keyof VisibilityPreferences) => {
      onVisibilityChange({
        ...visibilityPreferences,
        [key]: !visibilityPreferences[key]
      });
    };

    const clearVisibility = () => {
      onVisibilityChange({
        showHidden: false,
        showLocked: false,
        showFlagged: false
      });
    };
  
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Make Visible:</span>
        <div className="flex items-center gap-2">

        <button
              onClick={() => handleVisibilityToggle('showFlagged')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md border-2 bg-white ${
                visibilityPreferences.showFlagged ? 'border-red-400 bg-yellow-50' : 'border-gray-300'
              }`}
            >
              <Flag 
                size={12} 
                className={visibilityPreferences.showFlagged ? 'text-red-500' : 'text-gray-400'} 
              />
              <span className={`text-sm ${
                visibilityPreferences.showFlagged ? 'text-black-500' : 'text-gray-600'
              }`}>
                Flagged
              </span>
            </button>

          <button
            onClick={() => handleVisibilityToggle('showLocked')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md border-2 bg-white ${
              visibilityPreferences.showLocked ? 'border-yellow-800  bg-yellow-50' : 'border-gray-300'
            }`}
          >
            {visibilityPreferences.showLocked ? 
              <Lock size={12} className="text-yellow-800" /> : 
              <LockOpen size={12} className="text-gray-400" />
            }
            <span className={`text-sm ${
              visibilityPreferences.showLocked ? 'text-black' : 'text-gray-600'
            }`}>
              Locked
            </span>
          </button>

            <button
            onClick={() => handleVisibilityToggle('showHidden')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md border-2 rounded-md ${
              visibilityPreferences.showHidden ? 'border-orange-300  bg-yellow-50' : 'border-gray-300'
            }`}
          >
             <EyeOff
                size={10} 
                className={visibilityPreferences.showHidden ? 'text-orange-300 bg-yellow-50 ' : 'text-gray-400'} 
              />
              <span className={`text-sm ${
              visibilityPreferences.showLocked ? 'text-gray-900' : 'text-gray-600'
            }`}>
              Hidden
            </span>
          </button>
          

          {(visibilityPreferences.showHidden || 
            visibilityPreferences.showLocked || 
            visibilityPreferences.showFlagged) && (
            <button
              onClick={clearVisibility}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100"
              title="Clear all visibility filters"
            >
              <X size={16} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>
    );
  };

  export default TransactionVisibilityControls;