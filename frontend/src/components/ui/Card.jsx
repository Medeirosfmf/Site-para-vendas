import React from 'react';

export default function Card({ children, className = '', hover = false }) {
  return (
    <div className={`glass-card ${hover ? 'hover:scale-[1.02] cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}
