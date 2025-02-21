import React from 'react';

export const Switch = ({ checked, onCheckedChange, ...props }) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className={`
        relative inline-flex h-6 w-11 cursor-pointer rounded-full
        transition-colors focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-ring focus-visible:ring-offset-background
        bg-gray-300 dark:bg-gray-800
        ${checked ? 'bg-foreground' : 'bg-input'}
      `}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <span
        className={`
          pointer-events-none block h-5 w-5 rounded-full
          bg-background shadow-lg ring-0 transition-transform
          bg-blue-500 dark:bg-blue-600
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};
