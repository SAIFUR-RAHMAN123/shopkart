import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { formatPrice } from '../utils/format';

const csv = (v) => (v ? v.split(',').filter(Boolean) : []);

function Section({ title, children }) {
  return (
    <div className="border-b py-4 last:border-b-0">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">{title}</h3>
      {children}
    </div>
  );
}

export default function FilterSidebar({ query, update, clearAll, categories, brands, priceRange, open, onClose }) {
  const [min, setMin] = useState(query.minPrice || '');
  const [max, setMax] = useState(query.maxPrice || '');

  useEffect(() => {
    setMin(query.minPrice || '');
    setMax(query.maxPrice || '');
  }, [query.minPrice, query.maxPrice]);

  const checked = (key, value) => csv(query[key]).includes(value);
  const toggle = (key, value) => {
    const current = csv(query[key]);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key]: next.join(',') });
  };

  const applyPrice = (e) => {
    e.preventDefault();
    if (min && max && Number(min) > Number(max)) return toast.error('Min price cannot exceed max price');
    update({ minPrice: min, maxPrice: max });
  };

  const inputCls = 'w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <aside
      className={`${
        open ? 'fixed inset-0 z-50 overflow-y-auto bg-white' : 'hidden'
      } lg:static lg:z-auto lg:block lg:w-64 lg:shrink-0 lg:overflow-visible lg:bg-transparent`}
    >
      <div className="p-4 lg:rounded-lg lg:bg-white lg:shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Filters</h2>
          <div className="flex items-center gap-3">
            <button onClick={clearAll} className="text-sm font-semibold text-blue-600">Clear all</button>
            <button onClick={onClose} className="lg:hidden" aria-label="Close filters"><X /></button>
          </div>
        </div>

        <Section title="Categories">
          {categories.map((c) => (
            <label key={c._id} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
              <input type="checkbox" checked={checked('category', c.slug)} onChange={() => toggle('category', c.slug)} />
              {c.name}
            </label>
          ))}
        </Section>

        <Section title="Price">
          <form onSubmit={applyPrice} className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="number" min="0" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} className={inputCls} />
              <span className="text-gray-400">–</span>
              <input type="number" min="0" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} className={inputCls} />
            </div>
            {priceRange.max > 0 && (
              <p className="text-xs text-gray-500">{formatPrice(priceRange.min)} – {formatPrice(priceRange.max)}</p>
            )}
            <button className="w-full rounded-md bg-blue-600 py-1.5 text-sm font-semibold text-white">Apply</button>
          </form>
        </Section>

        <Section title="Customer rating">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
              <input type="radio" name="rating" checked={query.minRating === String(r)} onChange={() => update({ minRating: r })} />
              {r}★ &amp; above
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input type="radio" name="rating" checked={!query.minRating} onChange={() => update({ minRating: '' })} />
            Any
          </label>
        </Section>

        {brands.length > 0 && (
          <Section title="Brand">
            <div className="max-h-48 overflow-y-auto pr-1">
              {brands.map((b) => (
                <label key={b} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                  <input type="checkbox" checked={checked('brand', b)} onChange={() => toggle('brand', b)} />
                  {b}
                </label>
              ))}
            </div>
          </Section>
        )}

        <button onClick={onClose} className="mt-4 w-full rounded-md bg-blue-600 py-2 font-semibold text-white lg:hidden">
          Show results
        </button>
      </div>
    </aside>
  );
}