import { useEffect } from 'react';
import { GamepadState } from '@/store/types';
import { KeyboardMapping } from '@/store/types/keyboardMapping';

interface UseKeyboardControlsProps {
  enabled: boolean;
  mapping: KeyboardMapping;
  keyboardTarget: 1 | 2;
  updateGamepadState: (gamepadNum: 1 | 2, newState: Partial<GamepadState>) => void;
}

export const useKeyboardControls = ({
  enabled,
  mapping,
  keyboardTarget,
  updateGamepadState,
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled, mapping, keyboardTarget, updateGamepadState]);
};
