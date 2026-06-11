import React from 'react';
import Spinner from '../ui/Spinner';

export default function ChartCard({ 
  title, 
  subtitle, 
  loading = false, 
  children, 
  actions,
  className = ''
}) {
  return (
    <div className={`glass-card p-6 border border-dark-600 rounded-2xl relative overflow-hidden flex flex-col min-h-[350px] ${className}`}>
      {/* Glow highlight */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b border-dark-600 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Chart container body */}
      <div className="flex-grow flex items-center justify-center min-h-[220px] w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800/20 backdrop-blur-sm z-10 rounded-xl">
            <Spinner size="md" />
          </div>
        ) : null}
        
        <div className={`w-full h-full ${loading ? 'opacity-30' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
