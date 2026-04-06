import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-border/50">
          <Icon size={40} className="text-muted-foreground" />
        </div>
      )}

      <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
        {title}
      </h3>

      {description && (
        <p className="font-body text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="btn-cta text-sm py-3 px-6 transition-all duration-300 hover:scale-105"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
