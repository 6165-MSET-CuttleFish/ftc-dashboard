import React from 'react';
import clsx from 'clsx';
import {
  BaseViewHeading,
  BaseViewIcons,
  BaseViewIconButton,
} from '../BaseView';
import { ReactComponent as GamepadIcon } from '@/assets/icons/gamepad.svg';
import { ReactComponent as SettingsIcon } from '@/assets/icons/settings.svg';

interface GamepadHeaderProps {
  isDraggable: boolean;
  keyboardMappingEnabled: boolean;
  onToggleKeyboardMapping: () => void;
  onToggleSettings: () => void;
}

export const GamepadHeader: React.FC<GamepadHeaderProps> = ({
  isDraggable,
  keyboardMappingEnabled,
  onToggleKeyboardMapping,
  onToggleSettings,
}) => {
  return (
    <div className="flex items-center justify-between p-4">
      <BaseViewHeading isDraggable={isDraggable} className="mb-0 p-0">
        Dual Gamepad Controller
      </BaseViewHeading>
      <BaseViewIcons>
        <BaseViewIconButton
          onClick={onToggleKeyboardMapping}
          className={clsx(
            keyboardMappingEnabled 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          )}
        >
          <GamepadIcon className="h-5 w-5" />
        </BaseViewIconButton>
        <BaseViewIconButton
          onClick={onToggleSettings}
          className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
        >
          <SettingsIcon className="h-5 w-5" />
        </BaseViewIconButton>
      </BaseViewIcons>
    </div>
  );
};
