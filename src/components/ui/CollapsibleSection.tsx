import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './Card';

interface CollapsibleSectionProps {
  title: string;
  badge?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const CollapsibleSection = ({
  title,
  badge,
  children,
  defaultOpen = true,
  className = ''
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={`bg-white rounded shadow ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[#4338CA]">{title}</h2>
          {badge !== undefined && badge > 0 && (
            <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-sm">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 border-t">{children}</div>
      </div>
    </Card>
  );
};

export default CollapsibleSection;