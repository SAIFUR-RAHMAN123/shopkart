import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import PriceTag from './PriceTag';
import ProductImage from './ProductImage';

export default function ProductCard({ product: p }) {
  return (
    <Link
      to={`/products/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="relative aspect-square bg-gray-100">
        <ProductImage
          src={p.images[0]}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-contain p-3 transition group-hover:scale-105"
        />
        {p.discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
            {p.discount}% off
          </span>
        )}
        {p.stock === 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-red-600">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">{p.brand}</p>
        <h3 className="line-clamp-2 text-sm font-medium text-gray-800">{p.name}</h3>
        <StarRating rating={p.rating} count={p.numReviews} />
        <div className="mt-auto pt-1">
          <PriceTag price={p.price} finalPrice={p.finalPrice} discount={p.discount} />
        </div>
      </div>
    </Link>
  );
}