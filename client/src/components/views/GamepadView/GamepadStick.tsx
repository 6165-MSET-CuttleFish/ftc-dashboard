import React from 'react';
import clsx from 'clsx';

interface GamepadStickProps {
  x: number;
  y: number;
  label: string;
  upKey?: string;
  downKey?: string;
  leftKey?: string;
  rightKey?: string;
  isPressed?: boolean;
  onStickButtonClick?: () => void;
  onStickMove?: (x: number, y: number) => void;
  onStickReset?: () => void;
}

export const GamepadStick: React.FC<GamepadStickProps> = ({ 
  x, 
  y, 
  label, 
  upKey, 
  downKey, 
  leftKey, 
  rightKey,
  isPressed,
  onStickButtonClick,
  onStickMove,
  onStickReset
}) => {
  // Use percentage-based positioning for more accurate centering
  // Convert from -1,1 range to 0-100% with center at 50%
  const normalizedX = 50 + (x * 40); // -1 to 1 mapped to 10% to 90% (40% range from center)
  const normalizedY = 50 - (y * 40); // -1 to 1 mapped to 90% to 10% (invert Y, 40% range from center)
  
  const handleStickClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onStickMove) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const newX = ((event.clientX - centerX) / (rect.width / 2));
    const newY = -((event.clientY - centerY) / (rect.height / 2)); // Invert Y
    
    // Clamp values to [-1, 1] and apply deadzone
    const deadzone = 0.1;
    let clampedX = Math.max(-1, Math.min(1, newX));
    let clampedY = Math.max(-1, Math.min(1, newY));
    
    // Apply deadzone
    if (Math.abs(clampedX) < deadzone) clampedX = 0;
    if (Math.abs(clampedY) < deadzone) clampedY = 0;
    
    onStickMove(clampedX, clampedY);
  };

  const handleDoubleClick = () => {
    if (onStickReset) {
      onStickReset();
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div 
        className="relative h-24 w-24 rounded-full border-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
        onClick={handleStickClick}
        onDoubleClick={handleDoubleClick}
        title="Click to move stick, double-click to reset"
      >
        <div
          className={clsx(
            'absolute h-4 w-4 rounded-full transition-all pointer-events-none',
            isPressed 
              ? 'bg-blue-600 dark:bg-blue-400' 
              : 'bg-gray-600 dark:bg-gray-400'
          )}
          style={{
            left: `${normalizedX}%`,
            top: `${normalizedY}%`,
            transform: 'translate(-50%, -50%)', // Center the knob on its position
          }}
        />
        {/* Crosshair */}
        <div className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 bg-gray-300 dark:bg-gray-600 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 h-full w-0.5 -translate-x-1/2 -translate-y-1/2 bg-gray-300 dark:bg-gray-600 pointer-events-none" />
        
        {/* Key bindings around the stick */}
        {upKey && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 pointer-events-none">
            {upKey}
          </span>
        )}
        {downKey && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 pointer-events-none">
            {downKey}
          </span>
        )}
        {leftKey && (
          <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
            {leftKey}
          </span>
        )}
        {rightKey && (
          <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
            {rightKey}
          </span>
        )}
      </div>
      <button
        className={clsx(
          'rounded px-2 py-1 text-xs transition-colors',
          isPressed
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        )}
        onClick={onStickButtonClick}
      >
        {label}
      </button>
    </div>
  );
};
