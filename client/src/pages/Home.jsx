import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getCategories } from '../services/categoryService';
import ProductSection from '../components/ProductSection';
import HeroCarousel from '../components/HeroCarousel';
import TrustStrip from '../components/TrustStrip';

export default function Home() {
  const { data, loading } = useFetch(getCategories, []);

  return (
    <>
      <HeroCarousel />
      <TrustStrip />

      <section className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="mb-4 text-xl font-bold">Popular categories</h2>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {loading
            ? Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
            ))
            : data?.categories.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg bg-white p-3 text-center shadow-sm hover:shadow-md"
              >
                <img src={c.image} alt={c.name} loading="lazy" className="h-16 w-16 object-contain md:h-20 md:w-20" />
                <span className="text-xs font-medium md:text-sm">{c.name}</span>
              </Link>
            ))}
        </div>
      </section>

      <ProductSection title="Deals of the Day" params={{ minDiscount: 15, sort: 'price_asc' }} to="/products?minDiscount=15" />
      <ProductSection title="Featured Products" params={{ featured: true }} to="/products?featured=true" />
      <ProductSection title="Trending Now" params={{ sort: 'popularity' }} to="/products?sort=popularity" count={8} />
      <ProductSection title="Recommended for You" params={{ sort: 'rating' }} to="/products?sort=rating" />
    </>
  );
}