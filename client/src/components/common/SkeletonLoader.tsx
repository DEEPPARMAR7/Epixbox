import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'line' | 'grid' | 'avatar' | 'text';
  width?: string;
  height?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  type = 'card',
  width = 'w-full',
  height = 'h-32',
}) => {
  const baseClasses = 'bg-border/50 rounded-lg animate-pulse';

  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className={`${baseClasses} h-40 ${width}`} />
            <div className={`${baseClasses} h-4 w-3/4`} />
            <div className={`${baseClasses} h-4 w-1/2`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseClasses} aspect-square`} />
        ))}
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} h-3 ${i === count - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className={`${baseClasses} rounded-full ${width} ${height}`} />
    );
  }

  if (type === 'text') {
    return <div className={`${baseClasses} ${width} ${height}`} />;
  }

  return <div className={`${baseClasses} ${width} ${height}`} />;
};

export default SkeletonLoader;
