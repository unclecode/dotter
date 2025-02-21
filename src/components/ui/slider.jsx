import React from 'react';

export const Slider = ({ value, onValueChange, min, max, step, ...props }) => {
  return (
    <input
      type="range"
      value={value[0]}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      className="w-full h-2 bg-secondary rounded-full cursor-pointer bg-secondary/10 hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-offset-secondary
                dark:bg-secondary/20 accent-foreground"
      {...props}
    />
  );
};
