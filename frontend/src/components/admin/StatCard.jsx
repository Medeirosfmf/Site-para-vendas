import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function StatCard({ title, value, icon: Icon, color = 'primary', change }) {
  const [displayValue, setDisplayValue] = useState(0);

  // Parse numeric values for animation if appropriate
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const isCurrency = typeof value === 'string' && value.includes('R$');

  useEffect(() => {
    if (isNaN(numericValue) || numericValue <= 0) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 800; // ms
    const increment = end / (duration / 16); // ~60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(value);
      } else {
        if (isCurrency) {
          setDisplayValue(
            start.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          );
        } else {
          setDisplayValue(Math.floor(start));
        }
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, numericValue, isCurrency]);

  const colorClasses = {
    primary: {
      bg: 'bg-primary/10 text-primary border-primary/20',
      iconBg: 'bg-primary/20 text-primary',
    },
    success: {
      bg: 'bg-success/10 text-success border-success/20',
      iconBg: 'bg-success/20 text-success',
    },
    warning: {
      bg: 'bg-warning/10 text-warning border-warning/20',
      iconBg: 'bg-warning/20 text-warning',
    },
    danger: {
      bg: 'bg-danger/10 text-danger border-danger/20',
      iconBg: 'bg-danger/20 text-danger',
    },
    info: {
      bg: 'bg-secondary/10 text-secondary border-secondary/20',
      iconBg: 'bg-secondary/20 text-secondary',
    },
  };

  const currentColors = colorClasses[color] || colorClasses.primary;

  return (
    <div className={`glass-card p-6 border rounded-2xl relative overflow-hidden flex flex-col justify-between ${currentColors.bg}`}>
      {/* Decorative Blur */}
      <div className="absolute right-0 top-0 w-16 h-16 bg-white/5 blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className={`p-3 rounded-xl ${currentColors.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}

        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            change >= 0 
              ? 'bg-success/20 text-success border border-success/35' 
              : 'bg-danger/20 text-danger border border-danger/35'
          }`}>
            {change >= 0 ? (
              <>
                <FiTrendingUp className="w-3 h-3" />
                <span>+{change}%</span>
              </>
            ) : (
              <>
                <FiTrendingDown className="w-3 h-3" />
                <span>{change}%</span>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-3xl font-black text-white tracking-tight mb-1">
          {displayValue}
        </h3>
        <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
      </div>
    </div>
  );
}
