import { formatPrice } from '../utils/format';

export default function PriceTag({ price, finalPrice, discount, large }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-bold ${large ? 'text-3xl' : 'text-lg'}`}>{formatPrice(finalPrice)}</span>
      {discount > 0 && (
        <>
          <span className="text-sm text-gray-500 line-through">{formatPrice(price)}</span>
          <span className="text-sm font-semibold text-green-600">{discount}% off</span>
        </>
      )}
    </div>
  );
}