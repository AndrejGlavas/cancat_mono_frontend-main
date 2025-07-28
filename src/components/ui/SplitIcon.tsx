import React from 'react';
import { PiCaretLeftFill, PiCaretRightFill } from 'react-icons/pi';

interface SplitIconProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'bulk' | 'toggle';
  state?: boolean | null;
  onBulkClick?: (newState: boolean | null) => void;  // Add click handler for bulk mode
  disabled?: boolean;                                 // Add disabled state
}

export const SplitIcon: React.FC<SplitIconProps> = ({ 
  className = '',
  size = 10,
  variant = 'default',
  state = null,
  onBulkClick,
  disabled = false
}) => {
  // Core structural styles that won't change
  const coreOuterStyles = "rounded-full p-1 border-2 flex items-center justify-center";
  const coreInnerStyles = "flex w-8 h-8 text-sm border-2 font-serif rounded-full items-center justify-center font-semibold";

  // Internal tripleSwitch function to handle state transitions
  const tripleSwitch = (value: boolean | null): boolean | null => {
    switch (value) {
      case null:
        return true;   
      case true:
        return false;  
      case false:
        return null;   
      default:
        return true;
    }
  };

  // Handle click for bulk mode
  const handleBulkClick = () => {
    if (variant === 'bulk' && onBulkClick) {
      const nextState = tripleSwitch(state);
      onBulkClick(nextState);
    }
  };

  // Determine styles based on variant and state
  const getStyles = () => {
    if (variant === 'bulk') {
      if (state === null) {
        return {
          outer: "border-gray-300 bg-white",
          inner: "border-gray-300 bg-white",
          leftArrow: "text-gray-400",
          rightArrow: "text-gray-400",
          text: "text-gray-400"
        };
      }
      if (state === true) {
        return {
          outer: "border-green-700 bg-lime-200",
          inner: "border-blue-800 bg-white",
          leftArrow: "text-green-700",
          rightArrow: "text-blue-800",
          text: "text-slate-700"
        };
      }
    }
  
    if (variant === 'toggle') {
      if (state === true) {
        return {
          outer: "border-blue-800 bg-lime-200",
          inner: "border-blue-800 bg-white",
          leftArrow: "text-green-800",
          rightArrow: "text-blue-800",
          text: "text-blue-700"
        };
      }
      return {
        outer: "border-gray-300 bg-white",
        inner: "border-gray-300 bg-white", 
        leftArrow: "text-gray-400",
        rightArrow: "text-gray-400",
        text: "text-gray-400"
      };
    }
  
    return {
      outer: "",
      inner: "",
      leftArrow: "",
      rightArrow: "",
      text: ""
    };
  };
  
  const styles = getStyles();

  // Create the button wrapper for bulk mode
  if (variant === 'bulk') {
    return (
      <button
        onClick={handleBulkClick}
        disabled={disabled}
        className={`disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <div className={`w-${size} h-${size} ${coreOuterStyles} ${styles.outer}`}>
          <div className={`${coreInnerStyles} ${styles.inner}`}>
            <PiCaretLeftFill className={`size-6 ${styles.leftArrow}`} />
            <span className={styles.text}>S</span>
            <PiCaretRightFill className={`size-6 ${styles.rightArrow}`} />
          </div>
        </div>
      </button>
    );
  }

  // Regular render for non-bulk variants
  return (
    <div className={`w-${size} h-${size} ${coreOuterStyles} ${styles.outer} ${className}`}>
      <div className={`${coreInnerStyles} ${styles.inner}`}>
        <PiCaretLeftFill className={`size-6 ${styles.leftArrow}`} />
        <span className={styles.text}>S</span>
        <PiCaretRightFill className={`size-6 ${styles.rightArrow}`} />
      </div>
    </div>
  );
};

export default SplitIcon;