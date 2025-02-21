import React from 'react';

export const Label = ({ children, ...props }) => {
  return (
    <label 
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-7 text-gray-400" 
      {...props}
    >
      {children}
    </label>
  );
};
