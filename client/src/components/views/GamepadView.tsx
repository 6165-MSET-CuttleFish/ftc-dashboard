import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';

import BaseView, {
  BaseViewHeading,
  BaseViewBody,
  BaseViewProps,
  BaseViewHeadingProps,
  BaseViewIcons,
  BaseViewIconButton,
} from './BaseView';
import { RootState } from '@/store/reducers';
import { GamepadState } from '@/store/types';
import { KeyboardMapping, DEFAULT_KEYBOARD_MAPPING } from '@/store/types/keyboardMapping';
import { setKeyboardMapping, toggleKeyboardMappingEnabled } from '@/store/actions/keyboardMapping';
import { receiveGamepadState } from '@/store/actions/gamepad';

import { ReactComponent as GamepadIcon } from '@/assets/icons/gamepad.svg';
import { ReactComponent as SettingsIcon } from '@/assets/icons/settings.svg';

type GamepadViewProps = BaseViewProps & BaseViewHeadingProps;

interface GamepadButtonProps {
  label: string;
  isActive: boolean;
  value?: number;
  className?: string;
  keyBinding?: string;
  onClick?: () => void;
}

const GamepadButton: React.FC<GamepadButtonProps> = ({ 
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

interface StickProps {
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

const GamepadStick: React.FC<StickProps> = ({ 
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
  const normalizedX = (x + 1) * 50; // Convert from -1,1 to 0,100
  const normalizedY = (1 - y) * 50; // Convert from -1,1 to 0,100 (invert Y)
  
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
            left: `${normalizedX - 8}px`,
            top: `${normalizedY - 8}px`,
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

const GamepadView: React.FC<GamepadViewProps> = ({
  isDraggable = false,
  isUnlocked = false,
}) => {
  const dispatch = useDispatch();
  const [showSettings, setShowSettings] = useState(false);
  
  const gamepadConnectionState = useSelector((state: RootState) => state.gamepad);
  const keyboardMappingState = useSelector((state: RootState) => state.keyboardMapping);
  
  // For demo purposes, show a simulated gamepad state that responds to keyboard
  // In the future, this could show the actual gamepad state from the hardware
  const [currentGamepadState, setCurrentGamepadState] = useState<GamepadState>({
    left_stick_x: 0,
    left_stick_y: 0,
    right_stick_x: 0,
    right_stick_y: 0,
    dpad_up: false,
    dpad_down: false,
    dpad_left: false,
    dpad_right: false,
    a: false,
    b: false,
    x: false,
    y: false,
    guide: false,
    start: false,
    back: false,
    left_bumper: false,
    right_bumper: false,
    left_stick_button: false,
    right_stick_button: false,
    left_trigger: 0,
    right_trigger: 0,
  });

  // Function to dispatch gamepad state changes
  const updateGamepadState = useCallback((newState: Partial<GamepadState>) => {
    const updatedState = { ...currentGamepadState, ...newState };
    setCurrentGamepadState(updatedState);
    
    // Dispatch to Redux store to send to the robot
    dispatch(receiveGamepadState(updatedState, {
      left_stick_x: 0,
      left_stick_y: 0,
      right_stick_x: 0,
      right_stick_y: 0,
      dpad_up: false,
      dpad_down: false,
      dpad_left: false,
      dpad_right: false,
      a: false,
      b: false,
      x: false,
      y: false,
      guide: false,
      start: false,
      back: false,
      left_bumper: false,
      right_bumper: false,
      left_stick_button: false,
      right_stick_button: false,
      left_trigger: 0,
      right_trigger: 0,
    }));
  }, [currentGamepadState, dispatch]);

  // Button press handlers
  const createButtonHandler = useCallback((buttonKey: keyof GamepadState, value: boolean | number = true) => {
    return () => updateGamepadState({ [buttonKey]: value });
  }, [updateGamepadState]);

  const createButtonToggleHandler = useCallback((buttonKey: keyof GamepadState) => {
    return () => {
      const currentValue = currentGamepadState[buttonKey];
      const newValue = typeof currentValue === 'number' 
        ? (currentValue > 0 ? 0 : 1) 
        : !currentValue;
      updateGamepadState({ [buttonKey]: newValue });
    };
  }, [currentGamepadState, updateGamepadState]);

  // Stick interaction handlers
  const createStickHandler = useCallback((stickXKey: keyof GamepadState, stickYKey: keyof GamepadState) => {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = ((event.clientX - centerX) / (rect.width / 2));
      const y = -((event.clientY - centerY) / (rect.height / 2)); // Invert Y
      
      // Clamp values to [-1, 1]
      const clampedX = Math.max(-1, Math.min(1, x));
      const clampedY = Math.max(-1, Math.min(1, y));
      
      updateGamepadState({
        [stickXKey]: clampedX,
        [stickYKey]: clampedY
      });
    };
  }, [updateGamepadState]);

  const resetStick = useCallback((stickXKey: keyof GamepadState, stickYKey: keyof GamepadState) => {
    return () => {
      updateGamepadState({
        [stickXKey]: 0,
        [stickYKey]: 0
      });
    };
  }, [updateGamepadState]);
  
  
  // Keyboard event handling is now done in middleware, 
  // but we'll simulate the visual state for demonstration
  useEffect(() => {
    if (!keyboardMappingState.enabled) return;

    const pressedKeys = new Set<string>();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      pressedKeys.add(event.code);
      updateGamepadStateFromKeyboard();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.code);
      updateGamepadStateFromKeyboard();
    };

    const updateGamepadStateFromKeyboard = () => {
      const newState: GamepadState = { ...currentGamepadState };
      const mapping = keyboardMappingState.mapping;
      
      // Handle stick movements (analog)
      let leftStickX = 0;
      let leftStickY = 0;
      let rightStickX = 0;
      let rightStickY = 0;
      
      if (pressedKeys.has(mapping.left_stick_left || '')) leftStickX -= 1;
      if (pressedKeys.has(mapping.left_stick_right || '')) leftStickX += 1;
      if (pressedKeys.has(mapping.left_stick_up || '')) leftStickY += 1;
      if (pressedKeys.has(mapping.left_stick_down || '')) leftStickY -= 1;
      
      if (pressedKeys.has(mapping.right_stick_left || '')) rightStickX -= 1;
      if (pressedKeys.has(mapping.right_stick_right || '')) rightStickX += 1;
      if (pressedKeys.has(mapping.right_stick_up || '')) rightStickY += 1;
      if (pressedKeys.has(mapping.right_stick_down || '')) rightStickY -= 1;
      
      newState.left_stick_x = leftStickX;
      newState.left_stick_y = leftStickY;
      newState.right_stick_x = rightStickX;
      newState.right_stick_y = rightStickY;
      
      // Handle digital buttons
      newState.dpad_up = pressedKeys.has(mapping.dpad_up || '');
      newState.dpad_down = pressedKeys.has(mapping.dpad_down || '');
      newState.dpad_left = pressedKeys.has(mapping.dpad_left || '');
      newState.dpad_right = pressedKeys.has(mapping.dpad_right || '');
      
      newState.a = pressedKeys.has(mapping.a || '');
      newState.b = pressedKeys.has(mapping.b || '');
      newState.x = pressedKeys.has(mapping.x || '');
      newState.y = pressedKeys.has(mapping.y || '');
      
      newState.guide = pressedKeys.has(mapping.guide || '');
      newState.start = pressedKeys.has(mapping.start || '');
      newState.back = pressedKeys.has(mapping.back || '');
      
      newState.left_bumper = pressedKeys.has(mapping.left_bumper || '');
      newState.right_bumper = pressedKeys.has(mapping.right_bumper || '');
      
      newState.left_stick_button = pressedKeys.has(mapping.left_stick_button || '');
      newState.right_stick_button = pressedKeys.has(mapping.right_stick_button || '');
      
      // Handle triggers (analog)
      newState.left_trigger = pressedKeys.has(mapping.left_trigger || '') ? 1 : 0;
      newState.right_trigger = pressedKeys.has(mapping.right_trigger || '') ? 1 : 0;
      
      if (mapping.touchpad) {
        newState.touchpad = pressedKeys.has(mapping.touchpad);
      }
      
      setCurrentGamepadState(newState);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyboardMappingState.enabled, keyboardMappingState.mapping, currentGamepadState]);

  const formatKeyName = (keyCode: string) => {
    if (!keyCode) return '';
    return keyCode.replace(/^Key/, '').replace(/^Arrow/, '').replace(/Left$|Right$/, '');
  };

  return (
    <BaseView isUnlocked={isUnlocked}>
      <div className="flex items-center justify-between p-4">
        <BaseViewHeading isDraggable={isDraggable} className="mb-0 p-0">
          Gamepad View
        </BaseViewHeading>
        <BaseViewIcons>
          <BaseViewIconButton
            onClick={() => dispatch(toggleKeyboardMappingEnabled(!keyboardMappingState.enabled))}
            className={clsx(
              keyboardMappingState.enabled 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            )}
          >
            <GamepadIcon className="h-5 w-5" />
          </BaseViewIconButton>
          <BaseViewIconButton
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          >
            <SettingsIcon className="h-5 w-5" />
          </BaseViewIconButton>
        </BaseViewIcons>
      </div>
      
      <BaseViewBody className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <span className="text-sm font-medium">Keyboard Mapping:</span>
          <span className={clsx(
            'text-sm font-semibold',
            keyboardMappingState.enabled ? 'text-green-600' : 'text-gray-500'
          )}>
            {keyboardMappingState.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Usage Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-900">
          <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Interactive Gamepad Controls</div>
          <div className="text-blue-700 dark:text-blue-300 space-y-1">
            <div>• Click any button to toggle it on/off</div>
            <div>• Click analog sticks to set position, double-click to reset</div>
            <div>• Click triggers/bumpers to activate them</div>
            <div>• Use keyboard input or click controls - both work simultaneously</div>
          </div>
        </div>

        {/* Gamepad Layout */}
        <div className="flex flex-col space-y-8">
          {/* Top Row - Bumpers and Triggers */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <GamepadButton
                label="LB"
                isActive={currentGamepadState.left_bumper}
                keyBinding={formatKeyName(keyboardMappingState.mapping.left_bumper || '')}
                onClick={createButtonToggleHandler('left_bumper')}
              />
              <GamepadButton
                label="LT"
                isActive={currentGamepadState.left_trigger > 0}
                value={currentGamepadState.left_trigger}
                keyBinding={formatKeyName(keyboardMappingState.mapping.left_trigger || '')}
                onClick={createButtonToggleHandler('left_trigger')}
              />
            </div>
            <div className="flex space-x-2">
              <GamepadButton
                label="RT"
                isActive={currentGamepadState.right_trigger > 0}
                value={currentGamepadState.right_trigger}
                keyBinding={formatKeyName(keyboardMappingState.mapping.right_trigger || '')}
                onClick={createButtonToggleHandler('right_trigger')}
              />
              <GamepadButton
                label="RB"
                isActive={currentGamepadState.right_bumper}
                keyBinding={formatKeyName(keyboardMappingState.mapping.right_bumper || '')}
                onClick={createButtonToggleHandler('right_bumper')}
              />
            </div>
          </div>

          {/* Middle Row - Sticks and D-pad/Face buttons */}
          <div className="flex justify-between items-center">
            {/* Left Side - Left Stick and D-pad */}
            <div className="flex flex-col space-y-4">
              <GamepadStick
                x={currentGamepadState.left_stick_x}
                y={currentGamepadState.left_stick_y}
                label="L3"
                upKey={formatKeyName(keyboardMappingState.mapping.left_stick_up || '')}
                downKey={formatKeyName(keyboardMappingState.mapping.left_stick_down || '')}
                leftKey={formatKeyName(keyboardMappingState.mapping.left_stick_left || '')}
                rightKey={formatKeyName(keyboardMappingState.mapping.left_stick_right || '')}
                isPressed={currentGamepadState.left_stick_button}
                onStickButtonClick={createButtonToggleHandler('left_stick_button')}
                onStickMove={(x, y) => updateGamepadState({ left_stick_x: x, left_stick_y: y })}
                onStickReset={() => updateGamepadState({ left_stick_x: 0, left_stick_y: 0 })}
              />
              
              {/* D-pad */}
              <div className="grid grid-cols-3 gap-1">
                <div></div>
                <GamepadButton
                  label="↑"
                  isActive={currentGamepadState.dpad_up}
                  keyBinding={formatKeyName(keyboardMappingState.mapping.dpad_up || '')}
                  onClick={createButtonToggleHandler('dpad_up')}
                />
                <div></div>
                <GamepadButton
                  label="←"
                  isActive={currentGamepadState.dpad_left}
                  keyBinding={formatKeyName(keyboardMappingState.mapping.dpad_left || '')}
                  onClick={createButtonToggleHandler('dpad_left')}
                />
                <div></div>
                <GamepadButton
                  label="→"
                  isActive={currentGamepadState.dpad_right}
                  keyBinding={formatKeyName(keyboardMappingState.mapping.dpad_right || '')}
                  onClick={createButtonToggleHandler('dpad_right')}
                />
                <div></div>
                <GamepadButton
                  label="↓"
                  isActive={currentGamepadState.dpad_down}
                  keyBinding={formatKeyName(keyboardMappingState.mapping.dpad_down || '')}
                  onClick={createButtonToggleHandler('dpad_down')}
                />
                <div></div>
              </div>
            </div>

            {/* Center - Control buttons */}
            <div className="flex space-x-4">
              <GamepadButton
                label="Back"
                isActive={currentGamepadState.back}
                keyBinding={formatKeyName(keyboardMappingState.mapping.back || '')}
                onClick={createButtonToggleHandler('back')}
              />
              <GamepadButton
                label="Guide"
                isActive={currentGamepadState.guide}
                keyBinding={formatKeyName(keyboardMappingState.mapping.guide || '')}
                className="rounded-full"
                onClick={createButtonToggleHandler('guide')}
              />
              <GamepadButton
                label="Start"
                isActive={currentGamepadState.start}
                keyBinding={formatKeyName(keyboardMappingState.mapping.start || '')}
                onClick={createButtonToggleHandler('start')}
              />
            </div>

            {/* Right Side - Face buttons and Right Stick */}
            <div className="flex flex-col space-y-4">
              {/* Face buttons */}
              <div className="grid grid-cols-3 gap-1">
                <div></div>
                <GamepadButton
                  label="Y"
                  isActive={currentGamepadState.y}
                  keyBinding={formatKeyName(keyboardMappingState.mapping.y || '')}
                  onClick={createButtonToggleHandler('y')}
                />
                <div></div>
                <GamepadButton
                  label="X"
                  isActive={currentGamepadState.x}
                  keyBinding={formatKeyName(keyboardMappingState.mapping.x || '')}
                  onClick={createButtonToggleHandler('x')}
                />
                <div></div>
                <GamepadButton
                  label="B"
                  isActive={currentGamepadState.b}
                  keyBinding={formatKeyName(keyboardMappingState.mapping.b || '')}
                  onClick={createButtonToggleHandler('b')}
                />
                <div></div>
                <GamepadButton
                  label="A"
                  isActive={currentGamepadState.a}
                  keyBinding={formatKeyName(keyboardMappingState.mapping.a || '')}
                  onClick={createButtonToggleHandler('a')}
                />
                <div></div>
              </div>
              
              <GamepadStick
                x={currentGamepadState.right_stick_x}
                y={currentGamepadState.right_stick_y}
                label="R3"
                upKey={formatKeyName(keyboardMappingState.mapping.right_stick_up || '')}
                downKey={formatKeyName(keyboardMappingState.mapping.right_stick_down || '')}
                leftKey={formatKeyName(keyboardMappingState.mapping.right_stick_left || '')}
                rightKey={formatKeyName(keyboardMappingState.mapping.right_stick_right || '')}
                isPressed={currentGamepadState.right_stick_button}
                onStickButtonClick={createButtonToggleHandler('right_stick_button')}
                onStickMove={(x, y) => updateGamepadState({ right_stick_x: x, right_stick_y: y })}
                onStickReset={() => updateGamepadState({ right_stick_x: 0, right_stick_y: 0 })}
              />
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-2 font-medium">Hardware Gamepad Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Gamepad 1:</span>
              <span className={clsx(
                'font-semibold',
                gamepadConnectionState.gamepad1Connected ? 'text-green-600' : 'text-red-600'
              )}>
                {gamepadConnectionState.gamepad1Connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gamepad 2:</span>
              <span className={clsx(
                'font-semibold',
                gamepadConnectionState.gamepad2Connected ? 'text-green-600' : 'text-red-600'
              )}>
                {gamepadConnectionState.gamepad2Connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="mb-3 font-medium">Gamepad Control Settings</h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Keyboard Mapping:</strong> Control gamepad inputs using your keyboard. 
                This is useful for testing robot controls without a physical gamepad.
              </p>
              <p>
                <strong>Click Controls:</strong> Click any button or stick in the gamepad visualization 
                to send commands to the robot directly. This works alongside keyboard mapping.
              </p>
              <p>
                <strong>Both methods work simultaneously</strong> - you can use keyboard shortcuts and 
                click controls at the same time for maximum flexibility.
              </p>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                onClick={() => dispatch(setKeyboardMapping(DEFAULT_KEYBOARD_MAPPING))}
              >
                Reset Keyboard Mapping
              </button>
              <button
                className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                onClick={() => {
                  // Reset all gamepad controls to neutral state
                  const neutralState: GamepadState = {
                    left_stick_x: 0,
                    left_stick_y: 0,
                    right_stick_x: 0,
                    right_stick_y: 0,
                    dpad_up: false,
                    dpad_down: false,
                    dpad_left: false,
                    dpad_right: false,
                    a: false,
                    b: false,
                    x: false,
                    y: false,
                    guide: false,
                    start: false,
                    back: false,
                    left_bumper: false,
                    right_bumper: false,
                    left_stick_button: false,
                    right_stick_button: false,
                    left_trigger: 0,
                    right_trigger: 0,
                  };
                  updateGamepadState(neutralState);
                }}
              >
                Reset All Controls
              </button>
              <button
                className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </BaseViewBody>
    </BaseView>
  );
};

export default GamepadView;