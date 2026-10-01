import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getProducts, getProductFilters } from '../services/productService';
import { getCategories } from '../services/categoryService';
import ProductGrid from './ProductGrid';
import FilterSidebar from './FilterSidebar';
import Pagination from './Pagination';

const SORT_OPTIONS = [
  ['newest', 'Newest'],
  ['popularity', 'Popularity'],
  ['rating', 'Rating'],
  ['price_asc', 'Price: Low to High'],
  ['price_desc', 'Price: High to Low'],
];
const FILTER_KEYS = ['category', 'brand', 'minPrice', 'maxPrice', 'minRating', 'minDiscount', 'featured', 'page'];

export default function ProductListing({ title, fixed = {} }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = Object.fromEntries(searchParams);

  const { data, loading, error, reload } = useFetch(
    () => getProducts({ limit: 12, ...query, ...fixed }),
    [searchParams.toString(), JSON.stringify(fixed)]
  );

  // Facets (brands, price range) scoped to the current search + category
  const facetParams = { search: fixed.search || query.search, category: query.category };
  const { data: facets } = useFetch(() => getProductFilters(facetParams), [JSON.stringify(facetParams)]);
  const { data: catData } = useFetch(getCategories, []);
  const categories = catData?.categories || [];

  const update = (changes, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => {
    const next = new URLSearchParams(searchParams);
    FILTER_KEYS.forEach((k) => next.delete(k));
    setSearchParams(next);
  };

  const goToPage = (page) => {
    update({ page: page === 1 ? '' : page }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCats = (query.category || '').split(',').filter(Boolean);
  const heading =
    title ||
    (selectedCats.length === 1 && categories.find((c) => c.slug === selectedCats[0])?.name) ||
    'All Products';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{heading}</h1>
          {data && <p className="text-sm text-gray-500">{data.pagination.total} results</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-1 rounded-md border bg-white px-3 py-2 text-sm lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={query.sort || 'newest'}
            onChange={(e) => update({ sort: e.target.value })}
            className="rounded-md border bg-white px-3 py-2 text-sm"
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <FilterSidebar
          query={query}
          update={update}
          clearAll={clearAll}
          categories={categories}
          brands={facets?.brands || []}
          priceRange={{ min: facets?.minPrice || 0, max: facets?.maxPrice || 0 }}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
        <div className="min-w-0 flex-1">
          <ProductGrid products={data?.products} loading={loading} error={error} onRetry={reload} onClear={clearAll} count={12} />
          {data && <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={goToPage} />}
        </div>
      </div>
    </div>
  );
}