import React from 'react';
import clsx from 'clsx';
import { GamepadState } from '@/store/types';
import { GamepadButton } from './GamepadButton';
import { GamepadStick } from './GamepadStick';

interface GamepadControlsProps {
  gamepadNum: 1 | 2;
  gamepadState: GamepadState;
  isCompact?: boolean;
  isHardwareConnected: boolean;
  keyboardTarget: 1 | 2;
  formatKeyName: (keyCode: string) => string;
  keyboardMapping: any;
  createButtonToggleHandler: (gamepadNum: 1 | 2, buttonKey: keyof GamepadState) => () => void;
  updateGamepadState: (gamepadNum: 1 | 2, newState: Partial<GamepadState>) => void;
  resetGamepad: (gamepadNum: 1 | 2) => void;
}

export const GamepadControls: React.FC<GamepadControlsProps> = ({
  gamepadNum,
  gamepadState,
  isCompact = false,
  isHardwareConnected,
  keyboardTarget,
  formatKeyName,
  keyboardMapping,
  createButtonToggleHandler,
  updateGamepadState,
  resetGamepad,
}) => {
  return (
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
            isHardwareConnected ? 'text-green-600' : 'text-red-600'
          )}>
            {isHardwareConnected ? 'HW Connected' : 'HW Disconnected'}
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
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.left_bumper || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'left_bumper')}
                className={isCompact ? 'min-h-[50px] min-w-[50px]' : ''}
              />
              <GamepadButton
                label="LT"
                isActive={gamepadState.left_trigger > 0}
                value={gamepadState.left_trigger}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.left_trigger || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'left_trigger')}
                className={isCompact ? 'min-h-[50px] min-w-[50px]' : ''}
              />
            </div>
            <div className="flex space-x-2">
              <GamepadButton
                label="RT"
                isActive={gamepadState.right_trigger > 0}
                value={gamepadState.right_trigger}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.right_trigger || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'right_trigger')}
                className={isCompact ? 'min-h-[50px] min-w-[50px]' : ''}
              />
              <GamepadButton
                label="RB"
                isActive={gamepadState.right_bumper}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.right_bumper || '') : ''}
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
                upKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.left_stick_up || '') : ''}
                downKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.left_stick_down || '') : ''}
                leftKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.left_stick_left || '') : ''}
                rightKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.left_stick_right || '') : ''}
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
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.dpad_up || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'dpad_up')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="←"
                  isActive={gamepadState.dpad_left}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.dpad_left || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'dpad_left')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="→"
                  isActive={gamepadState.dpad_right}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.dpad_right || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'dpad_right')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="↓"
                  isActive={gamepadState.dpad_down}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.dpad_down || '') : ''}
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
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.back || '') : ''}
                onClick={createButtonToggleHandler(gamepadNum, 'back')}
                className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
              />
              <GamepadButton
                label="Guide"
                isActive={gamepadState.guide}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.guide || '') : ''}
                className={clsx('rounded-full', isCompact ? 'min-h-[40px] min-w-[40px]' : '')}
                onClick={createButtonToggleHandler(gamepadNum, 'guide')}
              />
              <GamepadButton
                label="Start"
                isActive={gamepadState.start}
                keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.start || '') : ''}
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
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.y || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'y')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="X"
                  isActive={gamepadState.x}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.x || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'x')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="B"
                  isActive={gamepadState.b}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.b || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'b')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
                <GamepadButton
                  label="A"
                  isActive={gamepadState.a}
                  keyBinding={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.a || '') : ''}
                  onClick={createButtonToggleHandler(gamepadNum, 'a')}
                  className={isCompact ? 'min-h-[40px] min-w-[40px]' : ''}
                />
                <div></div>
              </div>
              
              <GamepadStick
                x={gamepadState.right_stick_x}
                y={gamepadState.right_stick_y}
                label="R3"
                upKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.right_stick_up || '') : ''}
                downKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.right_stick_down || '') : ''}
                leftKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.right_stick_left || '') : ''}
                rightKey={gamepadNum === keyboardTarget ? formatKeyName(keyboardMapping.right_stick_right || '') : ''}
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
};
