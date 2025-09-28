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
  const [selectedGamepad, setSelectedGamepad] = useState<1 | 2>(1);
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('single');
  const [keyboardTarget, setKeyboardTarget] = useState<1 | 2>(1);
  
  const gamepadConnectionState = useSelector((state: RootState) => state.gamepad);
  const keyboardMappingState = useSelector((state: RootState) => state.keyboardMapping);
  
  // State for both gamepads
  const [gamepad1State, setGamepad1State] = useState<GamepadState>({
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

  const [gamepad2State, setGamepad2State] = useState<GamepadState>({
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
  const updateGamepadState = useCallback((gamepadNum: 1 | 2, newState: Partial<GamepadState>) => {
    if (gamepadNum === 1) {
      const updatedState = { ...gamepad1State, ...newState };
      setGamepad1State(updatedState);
      dispatch(receiveGamepadState(updatedState, gamepad2State));
    } else {
      const updatedState = { ...gamepad2State, ...newState };
      setGamepad2State(updatedState);
      dispatch(receiveGamepadState(gamepad1State, updatedState));
    }
  }, [gamepad1State, gamepad2State, dispatch]);

  // Button press handlers for specific gamepad
  const createButtonToggleHandler = useCallback((gamepadNum: 1 | 2, buttonKey: keyof GamepadState) => {
    return () => {
      const currentGamepadState = gamepadNum === 1 ? gamepad1State : gamepad2State;
      const currentValue = currentGamepadState[buttonKey];
      const newValue = typeof currentValue === 'number' 
        ? (currentValue > 0 ? 0 : 1) 
        : !currentValue;
      updateGamepadState(gamepadNum, { [buttonKey]: newValue });
    };
  }, [gamepad1State, gamepad2State, updateGamepadState]);

  // Reset all controls for a specific gamepad
  const resetGamepad = useCallback((gamepadNum: 1 | 2) => {
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
    updateGamepadState(gamepadNum, neutralState);
  }, [updateGamepadState]);
  // Get current gamepad state based on selection
  const currentGamepadState = selectedGamepad === 1 ? gamepad1State : gamepad2State;
  
  // Keyboard event handling for the selected keyboard target gamepad
  useEffect(() => {
    if (!keyboardMappingState.enabled) return;

    const pressedKeys = new Set<string>();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      pressedKeys.add(event.code);
      updateKeyboardGamepadState();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.code);
      updateKeyboardGamepadState();
    };

    const updateKeyboardGamepadState = () => {
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
      
      // Create the new state for the target gamepad
      const newState = {
        left_stick_x: leftStickX,
        left_stick_y: leftStickY,
        right_stick_x: rightStickX,
        right_stick_y: rightStickY,
        
        // Handle digital buttons
        dpad_up: pressedKeys.has(mapping.dpad_up || ''),
        dpad_down: pressedKeys.has(mapping.dpad_down || ''),
        dpad_left: pressedKeys.has(mapping.dpad_left || ''),
        dpad_right: pressedKeys.has(mapping.dpad_right || ''),
        
        a: pressedKeys.has(mapping.a || ''),
        b: pressedKeys.has(mapping.b || ''),
        x: pressedKeys.has(mapping.x || ''),
        y: pressedKeys.has(mapping.y || ''),
        
        guide: pressedKeys.has(mapping.guide || ''),
        start: pressedKeys.has(mapping.start || ''),
        back: pressedKeys.has(mapping.back || ''),
        
        left_bumper: pressedKeys.has(mapping.left_bumper || ''),
        right_bumper: pressedKeys.has(mapping.right_bumper || ''),
        
        left_stick_button: pressedKeys.has(mapping.left_stick_button || ''),
        right_stick_button: pressedKeys.has(mapping.right_stick_button || ''),
        
        // Handle triggers (analog)
        left_trigger: pressedKeys.has(mapping.left_trigger || '') ? 1 : 0,
        right_trigger: pressedKeys.has(mapping.right_trigger || '') ? 1 : 0,
        
        touchpad: mapping.touchpad ? pressedKeys.has(mapping.touchpad) : false,
      };
      
      // Update the state for the keyboard target gamepad
      updateGamepadState(keyboardTarget, newState);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyboardMappingState.enabled, keyboardMappingState.mapping, keyboardTarget, updateGamepadState]);
  
  const formatKeyName = (keyCode: string) => {
    if (!keyCode) return '';
    return keyCode.replace(/^Key/, '').replace(/^Arrow/, '').replace(/Left$|Right$/, '');
  };

  // Create a single gamepad component
  const renderGamepadControls = (gamepadNum: 1 | 2, gamepadState: GamepadState, isCompact = false) => (
    <div className={clsx('space-y-4', isCompact && 'scale-90 origin-top')}>
      {/* Gamepad Header */}
      <div className="flex items-center justify-between">
        <h3 className={clsx(
          'font-semibold text-gray-800 dark:text-gray-200',
          isCompact ? 'text-base' : 'text-lg'
        )}>
          Gamepad {gamepadNum}
        </h3>
        <div className="flex items-center space-x-2">
          <span className={clsx(
            'font-medium',
            isCompact ? 'text-xs' : 'text-sm',
            gamepadNum === 1 
              ? (gamepadConnectionState.gamepad1Connected ? 'text-green-600' : 'text-red-600')
              : (gamepadConnectionState.gamepad2Connected ? 'text-green-600' : 'text-red-600')
          )}>
            {gamepadNum === 1 
              ? (gamepadConnectionState.gamepad1Connected ? 'HW Connected' : 'HW Disconnected')
              : (gamepadConnectionState.gamepad2Connected ? 'HW Connected' : 'HW Disconnected')
            }
          </span>
          <button
            className={clsx(
              'rounded bg-red-500 text-white hover:bg-red-600',
              isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
            )}
            onClick={() => resetGamepad(gamepadNum)}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Gamepad Layout */}
      <div className={clsx(
        'rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
        isCompact ? 'p-4' : 'p-6'
      )}>
        <div className={clsx('flex flex-col', isCompact ? 'space-y-4' : 'space-y-6')}>
          {/* Top Row - Bumpers and Triggers */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <GamepadButton
                label="LB"
                isActive={gamepadState.left_bumper}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.left_bumper || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'left_bumper')}
                className={isCompact ? 'min-h-[50px] min-w-[50px]' : ''}
              />
              <GamepadButton
                label="LT"
                isActive={gamepadState.left_trigger > 0}
                value={gamepadState.left_trigger}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.left_trigger || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'left_trigger')}
                className={isCompact ? 'min-h-[50px] min-w-[50px]' : ''}
              />
            </div>
            <div className="flex space-x-2">
              <GamepadButton
                label="RT"
                isActive={gamepadState.right_trigger > 0}
                value={gamepadState.right_trigger}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.right_trigger || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'right_trigger')}
                className={isCompact ? 'min-h-[50px] min-w-[50px]' : ''}
              />
              <GamepadButton
                label="RB"
                isActive={gamepadState.right_bumper}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.right_bumper || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'right_bumper')}
                className={isCompact ? 'min-h-[50px] min-w-[50px]' : ''}
              />
            </div>
          </div>

          {/* Middle Row - Sticks and D-pad/Face buttons */}
          <div className="flex justify-between items-center">
            {/* Left Side - Left Stick and D-pad */}
            <div className={clsx('flex flex-col', isCompact ? 'space-y-3' : 'space-y-4')}>
              <GamepadStick
                x={gamepadState.left_stick_x}
                y={gamepadState.left_stick_y}
                label="L3"
                upKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.left_stick_up || '') : ''}
                downKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.left_stick_down || '') : ''}
                leftKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.left_stick_left || '') : ''}
                rightKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.left_stick_right || '') : ''}
                isPressed={gamepadState.left_stick_button}
                onStickButtonClick={createButtonToggleHandler(gamepadNum, 'left_stick_button')}
                onStickMove={(x, y) => updateGamepadState(gamepadNum, { left_stick_x: x, left_stick_y: y })}
                onStickReset={() => updateGamepadState(gamepadNum, { left_stick_x: 0, left_stick_y: 0 })}
              />
              
              {/* D-pad */}
              <div className="grid grid-cols-3 gap-1">
                <div></div>
                <GamepadButton
                  label="↑"
                  isActive={gamepadState.dpad_up}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.dpad_up || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'dpad_up')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="←"
                  isActive={gamepadState.dpad_left}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.dpad_left || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'dpad_left')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="→"
                  isActive={gamepadState.dpad_right}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.dpad_right || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'dpad_right')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="↓"
                  isActive={gamepadState.dpad_down}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.dpad_down || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'dpad_down')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
              </div>
            </div>

            {/* Center - Control buttons */}
            <div className={clsx('flex', isCompact ? 'space-x-2' : 'space-x-4')}>
              <GamepadButton
                label="Back"
                isActive={gamepadState.back}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.back || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'back')}
                className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
              />
              <GamepadButton
                label="Guide"
                isActive={gamepadState.guide}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.guide || '') : ''}
                className={clsx('rounded-full', isCompact ? 'min-h-[40px] min-w-[40px]' : '')}
                onClick={createButtonToggleHandler(gamepadNum, 'guide')}
              />
              <GamepadButton
                label="Start"
                isActive={gamepadState.start}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.start || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'start')}
                className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
              />
            </div>

            {/* Right Side - Face buttons and Right Stick */}
            <div className={clsx('flex flex-col', isCompact ? 'space-y-3' : 'space-y-4')}>
              {/* Face buttons */}
              <div className="grid grid-cols-3 gap-1">
                <div></div>
                <GamepadButton
                  label="Y"
                  isActive={gamepadState.y}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.y || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'y')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="X"
                  isActive={gamepadState.x}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.x || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'x')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="B"
                  isActive={gamepadState.b}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.b || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'b')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="A"
                  isActive={gamepadState.a}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.a || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'a')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
              </div>
              
              <GamepadStick
                x={gamepadState.right_stick_x}
                y={gamepadState.right_stick_y}
                label="R3"
                upKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.right_stick_up || '') : ''}
                downKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.right_stick_down || '') : ''}
                leftKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.right_stick_left || '') : ''}
                rightKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMappingState.mapping.right_stick_right || '') : ''}
                isPressed={gamepadState.right_stick_button}
                onStickButtonClick={createButtonToggleHandler(gamepadNum, 'right_stick_button')}
                onStickMove={(x, y) => updateGamepadState(gamepadNum, { right_stick_x: x, right_stick_y: y })}
                onStickReset={() => updateGamepadState(gamepadNum, { right_stick_x: 0, right_stick_y: 0 })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseView isUnlocked={isUnlocked}>
      <div className="flex items-center justify-between p-4">
        <BaseViewHeading isDraggable={isDraggable} className="mb-0 p-0">
          Dual Gamepad Controller
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
          <span className="text-sm font-medium">Keyboard Mapping (Gamepad 1 only):</span>
          <span className={clsx(
            'text-sm font-semibold',
            keyboardMappingState.enabled ? 'text-green-600' : 'text-gray-500'
          )}>
            {keyboardMappingState.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Usage Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-900">
          <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Interactive Dual Gamepad Controls</div>
          <div className="text-blue-700 dark:text-blue-300 space-y-1">
            <div>• Click any button to toggle it on/off</div>
            <div>• Click analog sticks to set position, double-click to reset</div>
            <div>• Use keyboard controls toggle to switch between Gamepad 1 and 2</div>
            <div>• Hardware gamepads override click/keyboard controls when connected</div>
          </div>
        </div>

        {/* Gamepad Selection Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              className={clsx(
                'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                selectedGamepad === 1
                  ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              onClick={() => setSelectedGamepad(1)}
            >
              Gamepad 1
              {gamepadConnectionState.gamepad1Connected && (
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
              onClick={() => setSelectedGamepad(2)}
            >
              Gamepad 2
              {gamepadConnectionState.gamepad2Connected && (
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
                onClick={() => setKeyboardTarget(1)}
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
                onClick={() => setKeyboardTarget(2)}
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
              onClick={() => setViewMode('single')}
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
              onClick={() => setViewMode('dual')}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Gamepad Controls */}
        {viewMode === 'single' ? (
          renderGamepadControls(selectedGamepad, currentGamepadState, false)
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {renderGamepadControls(1, gamepad1State, true)}
            {renderGamepadControls(2, gamepad2State, true)}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4">
          <button
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            onClick={() => resetGamepad(1)}
          >
            Reset Gamepad 1
          </button>
          <button
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            onClick={() => resetGamepad(2)}
          >
            Reset Gamepad 2
          </button>
          <button
            className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            onClick={() => {
              resetGamepad(1);
              resetGamepad(2);
            }}
          >
            Reset Both
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
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
                onClick={() => dispatch(setKeyboardMapping(DEFAULT_KEYBOARD_MAPPING))}
              >
                Reset Keyboard Mapping
              </button>
              <button
                className="rounded bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-600"
                onClick={() => {
                  resetGamepad(1);
                  resetGamepad(2);
                }}
              >
                Reset All Controls
              </button>
              <button
                className="col-span-2 rounded bg-gray-500 px-3 py-2 text-sm text-white hover:bg-gray-600"
                onClick={() => setShowSettings(false)}
              >
                Close Settings
              </button>
            </div>
          </div>
        )}
      </BaseViewBody>
    </BaseView>
  );
};

export default GamepadView;