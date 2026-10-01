import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart, Zap, Minus, Plus } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getProduct } from '../services/productService';
import StarRating from '../components/StarRating';
import PriceTag from '../components/PriceTag';
import ProductSection from '../components/ProductSection';

function DetailsSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl animate-pulse gap-8 px-4 py-6 md:grid-cols-2">
      <div className="aspect-square rounded-lg bg-gray-200" />
      <div className="space-y-4">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-8 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-10 w-1/2 rounded bg-gray-200" />
        <div className="h-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(() => getProduct(slug), [slug]);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setActive(0);
    setQty(1);
  }, [slug]);

  if (loading) return <DetailsSkeleton />;
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">{error}</p>
        <Link to="/products" className="mt-4 inline-block font-semibold text-blue-600">Back to products</Link>
      </div>
    );
  }

  const p = data.product;
  const soldOut = p.stock === 0;
  const maxQty = Math.min(p.stock, 10);

  // TODO Phase 8: replace with cart store actions
  const addToCart = () => toast('Cart coming soon');
  const buyNow = () => toast('Checkout coming soon');

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">Home</Link> ›{' '}
          <Link to={`/products?category=${p.category.slug}`} className="hover:text-blue-600">{p.category.name}</Link> ›{' '}
          <span className="text-gray-700">{p.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-white p-4 shadow-sm">
              <img src={p.images[active]} alt={p.name} className="h-full w-full object-contain" />
            </div>
            {p.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {p.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActive(i)}
                    className={`h-16 w-16 shrink-0 rounded-md border-2 bg-white p-1 ${
                      i === active ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wide text-gray-500">{p.brand}</p>
            <h1 className="text-2xl font-bold">{p.name}</h1>
            <StarRating rating={p.rating} count={p.numReviews} size={18} />
            <div>
              <PriceTag price={p.price} finalPrice={p.finalPrice} discount={p.discount} large />
              <p className="mt-1 text-xs text-gray-500">Inclusive of all taxes</p>
            </div>

            {soldOut ? (
              <p className="font-semibold text-red-600">Out of stock</p>
            ) : p.stock <= 5 ? (
              <p className="font-semibold text-orange-600">Only {p.stock} left</p>
            ) : (
              <p className="font-semibold text-green-600">In stock</p>
            )}

            {!soldOut && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center rounded-md border bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="p-2 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="p-2 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={soldOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 py-3 font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button
                onClick={buyNow}
                disabled={soldOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>

            <div>
              <h2 className="mb-1 font-semibold">Description</h2>
              <p className="text-sm leading-relaxed text-gray-700">{p.description}</p>
            </div>

            {p.specifications.length > 0 && (
              <div>
                <h2 className="mb-2 font-semibold">Specifications</h2>
                <dl className="divide-y rounded-md border bg-white text-sm">
                  {p.specifications.map((s) => (
                    <div key={s.key} className="grid grid-cols-3 gap-2 px-3 py-2">
                      <dt className="text-gray-500">{s.key}</dt>
                      <dd className="col-span-2">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductSection
        title="Similar products"
        params={{ category: p.category.slug }}
        excludeId={p._id}
        to={`/products?category=${p.category.slug}`}
      />
    </>
  );
}