import React from 'react';
import clsx from 'clsx';

interface GamepadToolbarProps {
  selectedGamepad: 1 | 2;
  viewMode: 'single' | 'dual';
  keyboardTarget: 1 | 2;
  gamepad1Connected: boolean;
  gamepad2Connected: boolean;
  onSelectGamepad: (gamepad: 1 | 2) => void;
  onSetViewMode: (mode: 'single' | 'dual') => void;
  onSetKeyboardTarget: (target: 1 | 2) => void;
}

export const GamepadToolbar: React.FC<GamepadToolbarProps> = ({
  selectedGamepad,
  viewMode,
  keyboardTarget,
  gamepad1Connected,
  gamepad2Connected,
  onSelectGamepad,
  onSetViewMode,
  onSetKeyboardTarget,
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* Gamepad Selection Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          className={clsx(
            'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            selectedGamepad === 1
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
          onClick={() => onSelectGamepad(1)}
        >
          Gamepad 1
          {gamepad1Connected && (
            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
          )}
        </button>
        <button
          className={clsx(
            'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            selectedGamepad === 2
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
          onClick={() => onSelectGamepad(2)}
        >
          Gamepad 2
          {gamepad2Connected && (
            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
          )}
        </button>
      </div>

      {/* Keyboard Target Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Keyboard controls:</span>
        <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            className={clsx(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              keyboardTarget === 1
                ? 'bg-blue-500 text-white shadow'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
            onClick={() => onSetKeyboardTarget(1)}
          >
            GP1
          </button>
          <button
            className={clsx(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              keyboardTarget === 2
                ? 'bg-blue-500 text-white shadow'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
            onClick={() => onSetKeyboardTarget(2)}
          >
            GP2
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          className={clsx(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            viewMode === 'single'
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
          onClick={() => onSetViewMode('single')}
        >
          Single View
        </button>
        <button
          className={clsx(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            viewMode === 'dual'
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
          onClick={() => onSetViewMode('dual')}
        >
          Side-by-Side
        </button>
      </div>
    </div>
  );
};
