import { useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getProducts } from '../services/productService';
import ProductGrid from '../components/ProductGrid';

export default function Products() {
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams);
  const { data, loading, error, reload } = useFetch(
    () => getProducts({ limit: 24, ...params }),
    [searchParams.toString()]
  );

  const title = !params.category
    ? 'All Products'
    : data?.products?.[0]?.category?.name || params.category.replace(/-/g, ' ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold capitalize">{title}</h1>
        {data && <span className="text-sm text-gray-500">{data.pagination.total} products</span>}
      </div>
      <ProductGrid products={data?.products} loading={loading} error={error} onRetry={reload} count={12} />
    </div>
  );
}