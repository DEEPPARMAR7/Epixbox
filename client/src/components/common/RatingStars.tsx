import React from 'react';
import { Star } from 'lucide-react';

export function RatingStars({ rating = 0, onRate, interactive = false, size = 'md' }) {
  const sizeMap = { sm: 16, md: 20, lg: 24 };
  const iconSize = sizeMap[size];

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          className={`transition ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          disabled={!interactive}
        >
          <Star
            size={iconSize}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingInput({ value, onChange, label = 'How would you rate this photo?' }) {
  return (
    <div className="space-y-3">
      {label && <label className="block font-medium text-sm">{label}</label>}
      <RatingStars rating={value} onRate={onChange} interactive={true} size="lg" />
    </div>
  );
}
