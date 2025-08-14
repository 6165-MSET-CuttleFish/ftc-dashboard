import React, { useState, useEffect, useCallback } from 'react';
import BaseView, {
  BaseViewHeading,
  BaseViewBody,
  BaseViewIcons,
  BaseViewIconButton,
} from 'client/src/assets/icons'; // Adjust path as needed
import { Play, Square, Keyboard }; // Assuming you have these icons

interface KeyboardState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  space: boolean;
  shift: boolean;
  ctrl: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  q: boolean;
  e: boolean;
  r: boolean;
  f: boolean;
}

interface KeyboardViewProps {
  isUnlocked?: boolean;
  onSendKeyboardState?: (keyboardState: KeyboardState) => void;
}

const KeyboardView: React.FC<KeyboardViewProps> = ({
  isUnlocked,
  onSendKeyboardState,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,
    ctrl: false,
    up: false,
    down: false,
    left: false,
    right: false,
    q: false,
    e: false,
    r: false,
    f: false,
  });

  // Key mapping from event keys to our state
  const keyMap: Record<string, keyof KeyboardState> = {
    'w': 'w',
    'W': 'w',
    'a': 'a',
    'A': 'a',
    's': 's',
    'S': 's',
    'd': 'd',
    'D': 'd',
    ' ': 'space',
    'Shift': 'shift',
    'Control': 'ctrl',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'q': 'q',
    'Q': 'q',
    'e': 'e',
    'E': 'e',
    'r': 'r',
    'R': 'r',
    'f': 'f',
    'F': 'f',
  };

  // Handle key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    const mappedKey = keyMap[event.key];
    if (mappedKey) {
      event.preventDefault();
      setKeyboardState(prev => {
        const newState = { ...prev, [mappedKey]: true };
        onSendKeyboardState?.(newState);
        return newState;
      });
    }
  }, [isEnabled, onSendKeyboardState]);

  // Handle key release
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    const mappedKey = keyMap[event.key];
    if (mappedKey) {
      event.preventDefault();
      setKeyboardState(prev => {
        const newState = { ...prev, [mappedKey]: false };
        onSendKeyboardState?.(newState);
        return newState;
      });
    }
  }, [isEnabled, onSendKeyboardState]);

  // Set up event listeners
  useEffect(() => {
    if (isEnabled) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEnabled, handleKeyDown, handleKeyUp]);

  // Clear all keys when disabled
  useEffect(() => {
    if (!isEnabled) {
      const clearedState = Object.keys(keyboardState).reduce((acc, key) => {
        acc[key as keyof KeyboardState] = false;
        return acc;
      }, {} as KeyboardState);
      setKeyboardState(clearedState);
      onSendKeyboardState?.(clearedState);
    }
  }, [isEnabled]);

  const toggleKeyboard = () => {
    setIsEnabled(!isEnabled);
  };

  // Render individual key indicator
  const KeyIndicator = ({ keyName, isActive, displayName }: {
    keyName: string;
    isActive: boolean;
    displayName?: string;
  }) => (
    <div
      className={`
        flex items-center justify-center
        w-12 h-12 rounded border-2 text-sm font-medium
        transition-all duration-150
        ${isActive 
          ? 'bg-blue-500 border-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
        }
      `}
    >
      {displayName || keyName.toUpperCase()}
    </div>
  );

  return (
    <BaseView isUnlocked={isUnlocked}>
      <div className="flex items-center justify-between">
        <BaseViewHeading isDraggable={isUnlocked}>
          <div className="flex items-center space-x-2">
            <Keyboard size={20} />
            <span>Keyboard Emulator</span>
          </div>
        </BaseViewHeading>
        
        <BaseViewIcons>
          <BaseViewIconButton
            onClick={toggleKeyboard}
            className={`${
              isEnabled
                ? 'text-red-500 hover:text-red-600'
                : 'text-green-500 hover:text-green-600'
            }`}
            title={isEnabled ? 'Stop Keyboard Emulator' : 'Start Keyboard Emulator'}
          >
            {isEnabled ? <Square size={18} /> : <Play size={18} />}
          </BaseViewIconButton>
        </BaseViewIcons>
      </div>

      <BaseViewBody>
        <div className="space-y-6">
          {/* Status */}
          <div className="text-center">
            <div
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${isEnabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }
              `}
            >
              {isEnabled ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {isEnabled
              ? 'Press keys to control the robot. Keys will light up when pressed.'
              : 'Click the play button to start keyboard control.'
            }
          </div>

          {/* Key Layout */}
          <div className="space-y-4">
            {/* WASD Movement */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Movement (Left Stick)
              </h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <KeyIndicator keyName="w" isActive={keyboardState.w} />
                  <div></div>
                  <KeyIndicator keyName="a" isActive={keyboardState.a} />
                  <KeyIndicator keyName="s" isActive={keyboardState.s} />
                  <KeyIndicator keyName="d" isActive={keyboardState.d} />
                </div>
              </div>
            </div>

            {/* Arrow Keys */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Camera (Right Stick)
              </h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <KeyIndicator keyName="up" isActive={keyboardState.up} displayName="↑" />
                  <div></div>
                  <KeyIndicator keyName="left" isActive={keyboardState.left} displayName="←" />
                  <KeyIndicator keyName="down" isActive={keyboardState.down} displayName="↓" />
                  <KeyIndicator keyName="right" isActive={keyboardState.right} displayName="→" />
                </div>
              </div>
            </div>

            {/* Action Keys */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Actions
              </h3>
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                <KeyIndicator keyName="space" isActive={keyboardState.space} displayName="SPC" />
                <KeyIndicator keyName="shift" isActive={keyboardState.shift} displayName="⇧" />
                <KeyIndicator keyName="q" isActive={keyboardState.q} />
                <KeyIndicator keyName="e" isActive={keyboardState.e} />
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto mt-2">
                <KeyIndicator keyName="r" isActive={keyboardState.r} />
                <KeyIndicator keyName="f" isActive={keyboardState.f} />
                <KeyIndicator keyName="ctrl" isActive={keyboardState.ctrl} displayName="CTRL" />
              </div>
            </div>
          </div>

          {/* Key Mapping Reference */}
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <div className="font-medium">Key Mapping:</div>
            <div>WASD → Left Stick | Arrows → Right Stick</div>
            <div>Space → A | Shift → B | Q → X | E → Y</div>
            <div>R → Left Bumper | F → Right Bumper | Ctrl → Left Trigger</div>
          </div>
        </div>
      </BaseViewBody>
    </BaseView>
  );
};

export default KeyboardView;