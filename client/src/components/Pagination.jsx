import { ChevronLeft, ChevronRight } from 'lucide-react';

const getPages = (page, pages) => {
  const nums = [...new Set([1, pages, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push('...');
    out.push(n);
  });
  return out;
};

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const btn = 'flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm';

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className={`${btn} bg-white disabled:opacity-40`} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {getPages(page, pages).map((n, i) =>
        n === '...' ? (
          <span key={`dots-${i}`} className="px-1 text-gray-400">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`${btn} ${n === page ? 'border-blue-600 bg-blue-600 font-semibold text-white' : 'bg-white hover:bg-gray-100'}`}
          >
            {n}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === pages} className={`${btn} bg-white disabled:opacity-40`} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}