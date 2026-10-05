import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    tag: 'Big Savings Days',
    title: "Everything you need, at prices you'll love",
    text: 'Mobiles, laptops, fashion, home essentials and more, delivered across India.',
    primary: ['Shop now', '/products'],
    secondary: ['View deals', '/products?minDiscount=20'],
    bg: 'from-blue-600 via-blue-500 to-indigo-600',
  },
  {
    tag: 'Mobiles & Laptops',
    title: 'Upgrade your tech',
    text: 'The latest smartphones and laptops from top brands.',
    primary: ['Shop mobiles', '/products?category=mobiles'],
    secondary: ['Shop laptops', '/products?category=laptops'],
    bg: 'from-purple-600 via-fuchsia-600 to-pink-500',
  },
  {
    tag: 'Fashion & Accessories',
    title: 'Refresh your wardrobe',
    text: 'Clothing, shoes, watches and accessories for every style.',
    primary: ['Shop fashion', '/products?category=fashion'],
    secondary: ['Shop watches', '/products?category=watches'],
    bg: 'from-emerald-600 via-teal-500 to-cyan-600',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (n) => setIndex((n + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((s) => (
          <div key={s.title} className={`w-full shrink-0 bg-gradient-to-r ${s.bg}`}>
            <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-12 md:px-16 md:py-20">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">{s.tag}</span>
              <h1 className="max-w-xl text-3xl font-extrabold md:text-5xl">{s.title}</h1>
              <p className="max-w-lg text-white/90">{s.text}</p>
              <div className="flex flex-wrap gap-3">
                <Link to={s.primary[1]} className="rounded-md bg-orange-500 px-6 py-3 font-semibold hover:bg-orange-600">{s.primary[0]}</Link>
                <Link to={s.secondary[1]} className="rounded-md bg-white px-6 py-3 font-semibold text-gray-900">{s.secondary[0]}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => go(index - 1)} aria-label="Previous slide" className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 hover:bg-black/50 md:block">
        <ChevronLeft />
      </button>
      <button onClick={() => go(index + 1)} aria-label="Next slide" className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 hover:bg-black/50 md:block">
        <ChevronRight />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2.5 bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}