import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={size} className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
        ))}
      </div>
      <span className="text-xs text-gray-600">
        {rating.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
}