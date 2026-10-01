import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

const gridClass = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4';

export default function ProductGrid({ products = [], loading, error, onRetry, onClear, count = 8 }) {
    if (loading) {
        return (
            <div className={gridClass}>
                {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
            </div>
        );
    }
    if (error) {
        return (
            <div className="rounded-lg bg-white py-12 text-center">
                <p className="font-medium text-red-600">{error}</p>
                {onRetry && (
                    <button onClick={onRetry} className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                        Try again
                    </button>
                )}
            </div>
        );
    }
    if (!products.length) {
        return (
            <div className="rounded-lg bg-white py-16 text-center">
                <p className="text-lg font-semibold">No products found</p>
                <p className="mt-1 text-sm text-gray-500">Try a different category or clear your filters.</p>
                {onClear ? (
                    <button onClick={onClear} className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                        Clear filters
                    </button>
                ) : (
                    <Link to="/products" className="mt-4 inline-block text-sm font-semibold text-blue-600">
                        Browse all products
                    </Link>
                )}
            </div>
        );
    }
    return (
        <div className={gridClass}>
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
    );
}