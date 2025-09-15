import { Middleware } from 'redux';
import { RootState } from '@/store/reducers';
import { GamepadState } from '@/store/types';
import { receiveGamepadState } from '@/store/actions/gamepad';

let keyboardGamepadState: GamepadState = {
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

const keyboardInputMiddleware: Middleware<Record<string, unknown>, RootState> = (store) => {
  const pressedKeys = new Set<string>();
  
  let lastGamepadState = { ...keyboardGamepadState };
  
  const updateGamepadStateFromKeyboard = () => {
    const state = store.getState();
    const { mapping, enabled } = state.keyboardMapping;
    
    if (!enabled) {
      // Reset to default state when disabled
      if (Object.values(keyboardGamepadState).some(v => v !== 0 && v !== false)) {
        keyboardGamepadState = {
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
      }
      return;
    }
    
    const newState: GamepadState = { ...keyboardGamepadState };
    
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
    
    keyboardGamepadState = newState;
    
    // Only dispatch if state has changed to avoid unnecessary updates
    const hasChanged = JSON.stringify(lastGamepadState) !== JSON.stringify(newState);
    if (hasChanged) {
      lastGamepadState = { ...newState };
      // Send as gamepad 1 by default, could be configurable
      store.dispatch(receiveGamepadState(newState, {
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
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const state = store.getState();
    if (!state.keyboardMapping.enabled) return;
    
    pressedKeys.add(event.code);
    updateGamepadStateFromKeyboard();
    
    // Prevent default behavior for mapped keys to avoid interfering with other controls
    const mappingValues = Object.values(state.keyboardMapping.mapping);
    if (mappingValues.includes(event.code)) {
      event.preventDefault();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const state = store.getState();
    if (!state.keyboardMapping.enabled) return;
    
    pressedKeys.delete(event.code);
    updateGamepadStateFromKeyboard();
  };
  
  // Set up global keyboard listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return (next) => (action) => {
    const result = next(action);
    
    // Update gamepad state when keyboard mapping settings change
    if (action.type === 'KEYBOARD_MAPPING_SET_MAPPING' || action.type === 'KEYBOARD_MAPPING_TOGGLE_ENABLED') {
      updateGamepadStateFromKeyboard();
    }
    
    return result;
  };
};

export default keyboardInputMiddleware;