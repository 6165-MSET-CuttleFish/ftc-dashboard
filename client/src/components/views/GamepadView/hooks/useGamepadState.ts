import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { GamepadState } from '@/store/types';
import { receiveGamepadState } from '@/store/actions/gamepad';

const createInitialGamepadState = (): GamepadState => ({
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

export const useGamepadState = () => {
  const dispatch = useDispatch();
  const [gamepad1State, setGamepad1State] = useState<GamepadState>(createInitialGamepadState());
  const [gamepad2State, setGamepad2State] = useState<GamepadState>(createInitialGamepadState());

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

  const resetGamepad = useCallback((gamepadNum: 1 | 2) => {
    const neutralState = createInitialGamepadState();
    updateGamepadState(gamepadNum, neutralState);
  }, [updateGamepadState]);

  return {
    gamepad1State,
    gamepad2State,
    updateGamepadState,
    createButtonToggleHandler,
    resetGamepad,
  };
};
