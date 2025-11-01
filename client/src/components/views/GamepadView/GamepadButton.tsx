import React from 'react';
import clsx from 'clsx';

interface GamepadButtonProps {
  label: string;
  isActive: boolean;
  value?: number;
  className?: string;
  keyBinding?: string;
  onClick?: () => void;
}

export const GamepadButton: React.FC<GamepadButtonProps> = ({ 
  label, 
  isActive, 
  value, 
  className, 
  keyBinding,
  onClick 
}) => {
  const isAnalog = value !== undefined;
  const displayValue = isAnalog ? (value * 100).toFixed(0) + '%' : label;
  
  return (
    <button
      className={clsx(
        'flex flex-col items-center justify-center rounded-md border-2 p-2 text-xs font-medium transition-all',
        'min-h-[60px] min-w-[60px] relative',
        'hover:scale-105 active:scale-95',
        isActive 
          ? 'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
          : 'border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-900/20',
        className
      )}
      onClick={onClick}
      title={keyBinding ? `Click to toggle, or press '${keyBinding}'` : 'Click to toggle'}
    >
      <span className="font-semibold">{displayValue}</span>
      {keyBinding && (
        <span className="absolute bottom-1 text-[10px] opacity-70">
          {keyBinding}
        </span>
      )}
    </button>
  );
};
