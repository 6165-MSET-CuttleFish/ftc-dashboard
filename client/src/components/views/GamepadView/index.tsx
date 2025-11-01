import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';

import BaseView, {
  BaseViewBody,
  BaseViewProps,
  BaseViewHeadingProps,
} from '../BaseView';
import { RootState } from '@/store/reducers';
import { DEFAULT_KEYBOARD_MAPPING } from '@/store/types/keyboardMapping';
import { setKeyboardMapping, toggleKeyboardMappingEnabled } from '@/store/actions/keyboardMapping';

import { GamepadHeader } from './GamepadHeader';
import { GamepadToolbar } from './GamepadToolbar';
import { GamepadControls } from './GamepadControls';
import { GamepadSettings } from './GamepadSettings';
import { useGamepadState } from './hooks/useGamepadState';
import { useKeyboardControls } from './hooks/useKeyboardControls';

type GamepadViewProps = BaseViewProps & BaseViewHeadingProps;

const formatKeyName = (keyCode: string) => {
  if (!keyCode) return '';
  return keyCode.replace(/^Key/, '').replace(/^Arrow/, '').replace(/Left$|Right$/, '');
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
  
  const {
    gamepad1State,
    gamepad2State,
    updateGamepadState,
    createButtonToggleHandler,
    resetGamepad,
  } = useGamepadState();

  useKeyboardControls({
    enabled: keyboardMappingState.enabled,
    mapping: keyboardMappingState.mapping,
    keyboardTarget,
    updateGamepadState,
  });

  const currentGamepadState = selectedGamepad === 1 ? gamepad1State : gamepad2State;

  const handleResetAllControls = () => {
    resetGamepad(1);
    resetGamepad(2);
  };

  return (
    <BaseView isUnlocked={isUnlocked}>
      <GamepadHeader
        isDraggable={isDraggable}
        keyboardMappingEnabled={keyboardMappingState.enabled}
        showSettings={showSettings}
        onToggleKeyboardMapping={() => dispatch(toggleKeyboardMappingEnabled(!keyboardMappingState.enabled))}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />
      
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

        <GamepadToolbar
          selectedGamepad={selectedGamepad}
          viewMode={viewMode}
          keyboardTarget={keyboardTarget}
          gamepad1Connected={gamepadConnectionState.gamepad1Connected}
          gamepad2Connected={gamepadConnectionState.gamepad2Connected}
          onSelectGamepad={setSelectedGamepad}
          onSetViewMode={setViewMode}
          onSetKeyboardTarget={setKeyboardTarget}
        />

        {/* Gamepad Controls */}
        {viewMode === 'single' ? (
          <GamepadControls
            gamepadNum={selectedGamepad}
            gamepadState={currentGamepadState}
            isCompact={false}
            isHardwareConnected={
              selectedGamepad === 1 
                ? gamepadConnectionState.gamepad1Connected 
                : gamepadConnectionState.gamepad2Connected
            }
            keyboardTarget={keyboardTarget}
            formatKeyName={formatKeyName}
            keyboardMapping={keyboardMappingState.mapping}
            createButtonToggleHandler={createButtonToggleHandler}
            updateGamepadState={updateGamepadState}
            resetGamepad={resetGamepad}
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GamepadControls
              gamepadNum={1}
              gamepadState={gamepad1State}
              isCompact={true}
              isHardwareConnected={gamepadConnectionState.gamepad1Connected}
              keyboardTarget={keyboardTarget}
              formatKeyName={formatKeyName}
              keyboardMapping={keyboardMappingState.mapping}
              createButtonToggleHandler={createButtonToggleHandler}
              updateGamepadState={updateGamepadState}
              resetGamepad={resetGamepad}
            />
            <GamepadControls
              gamepadNum={2}
              gamepadState={gamepad2State}
              isCompact={true}
              isHardwareConnected={gamepadConnectionState.gamepad2Connected}
              keyboardTarget={keyboardTarget}
              formatKeyName={formatKeyName}
              keyboardMapping={keyboardMappingState.mapping}
              createButtonToggleHandler={createButtonToggleHandler}
              updateGamepadState={updateGamepadState}
              resetGamepad={resetGamepad}
            />
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
            onClick={handleResetAllControls}
          >
            Reset Both
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <GamepadSettings
            onResetKeyboardMapping={() => dispatch(setKeyboardMapping(DEFAULT_KEYBOARD_MAPPING))}
            onResetAllControls={handleResetAllControls}
            onClose={() => setShowSettings(false)}
          />
        )}
      </BaseViewBody>
    </BaseView>
  );
};

export default GamepadView;
