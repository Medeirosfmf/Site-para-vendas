import React from 'react';

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-card">
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-dark-700/50 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-text-muted" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md mb-8">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
