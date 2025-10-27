
import React from 'react';

interface ToggleSwitchProps {
  label?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange, id }) => {
  const switchId = id || label;
  return (
    <div className="flex items-center justify-between">
      {label && <label htmlFor={switchId} className="block text-sm font-medium text-gray-300">{label}</label>}
      <button
        type="button"
        id={switchId}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${enabled ? 'bg-green-600' : 'bg-gray-600'}`}
        aria-pressed={enabled}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
};
