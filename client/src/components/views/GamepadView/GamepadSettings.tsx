import React from 'react';
import { DEFAULT_KEYBOARD_MAPPING } from '@/store/types/keyboardMapping';

interface GamepadSettingsProps {
  onResetKeyboardMapping: () => void;
  onResetAllControls: () => void;
  onClose: () => void;
}

export const GamepadSettings: React.FC<GamepadSettingsProps> = ({
  onResetKeyboardMapping,
  onResetAllControls,
  onClose,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h4 className="mb-3 font-medium">Dual Gamepad Control Settings</h4>
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Keyboard Mapping:</strong> Control Gamepad 1 inputs using your keyboard. 
          This is useful for testing robot controls without a physical gamepad.
        </p>
        <p>
          <strong>Click Controls:</strong> Click any button or stick in either gamepad visualization 
          to send commands to the robot directly. Works for both gamepads.
        </p>
        <p>
          <strong>Hardware Gamepads:</strong> Connect physical gamepads using Start+A for Gamepad 1 
          or Start+B for Gamepad 2. Hardware input will override virtual controls.
        </p>
        <p>
          <strong>Dual Control:</strong> Both gamepads work independently - you can control 
          one with keyboard/clicks and another with hardware, or use any combination.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          className="rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
          onClick={onResetKeyboardMapping}
        >
          Reset Keyboard Mapping
        </button>
        <button
          className="rounded bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-600"
          onClick={onResetAllControls}
        >
          Reset All Controls
        </button>
        <button
          className="col-span-2 rounded bg-gray-500 px-3 py-2 text-sm text-white hover:bg-gray-600"
          onClick={onClose}
        >
          Close Settings
        </button>
      </div>
    </div>
  );
};
