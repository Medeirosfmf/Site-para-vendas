import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-text-muted" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`input-field ${Icon ? 'pl-10' : ''} ${
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-danger mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
