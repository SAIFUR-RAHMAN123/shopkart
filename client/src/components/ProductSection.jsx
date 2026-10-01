import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getProducts } from '../services/productService';
import ProductGrid from './ProductGrid';

export default function ProductSection({ title, params, to, excludeId, count = 4 }) {
  const { data, loading, error, reload } = useFetch(
    () => getProducts({ ...params, limit: count + (excludeId ? 1 : 0) }),
    [JSON.stringify(params), excludeId, count]
  );
  const products = (data?.products || []).filter((p) => p._id !== excludeId).slice(0, count);

  if (!loading && !error && !products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        {to && <Link to={to} className="text-sm font-semibold text-blue-600">View all</Link>}
      </div>
      <ProductGrid products={products} loading={loading} error={error} onRetry={reload} count={count} />
    </section>
  );
}