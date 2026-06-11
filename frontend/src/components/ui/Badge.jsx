import React from 'react';

export default function Badge({ children, color = 'primary', className = '' }) {
  return (
    <span className={`badge badge-${color} ${className}`}>
      {children}
    </span>
  );
}
