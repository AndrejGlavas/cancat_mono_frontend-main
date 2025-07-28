// components/TransactionTypeSelector.tsx
import React from 'react';
import { TransactionType } from '../utils/types';

interface TransactionTypeSelectorProps {
  selectedType?: TransactionType;
  onChange: (type: TransactionType) => void;
}

const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({
  selectedType,
  onChange
}) => {
  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={() => onChange(TransactionType.BUSINESS)}
        className={`w-6 h-6 rounded-full flex items-center justify-center 
          ${selectedType === TransactionType.BUSINESS 
            ? 'border-4 border-blue-500 text-blue-500' 
            : 'border-4 border-gray-300 text-gray-400'
          }`}
      >
        B
      </button>
      <button
        onClick={() => onChange(TransactionType.PERSONAL)}
        className={`w-6 h-6 rounded-full flex items-center justify-center
          ${selectedType === TransactionType.PERSONAL 
            ? 'border-4 border-green-600 text-green-600' 
            : 'border-4 border-gray-300 text-gray-400'
          }`}
      >
        P
      </button>
    </div>
  );
};

export default TransactionTypeSelector;