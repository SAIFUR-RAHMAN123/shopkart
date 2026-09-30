import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getCategories } from '../services/categoryService';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const cartCount = 0; // wired up in Phase 8

  useEffect(() => {
    getCategories().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  const onLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };
  const closeMenu = () => setMenuOpen(false);

  const accountLinks = [
    { to: '/profile', label: 'My Profile' },
    { to: '/orders', label: 'My Orders' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Dashboard' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 shadow-md">
      <div className="bg-blue-600 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
          <Link to="/" className="text-2xl font-extrabold italic tracking-tight">
            ShopKart
          </Link>

          <form
            onSubmit={onSearch}
            className="order-last flex w-full overflow-hidden rounded-md bg-white md:order-none md:w-auto md:max-w-2xl md:flex-1"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, brands and more"
              className="w-full px-4 py-2 text-sm text-gray-800 outline-none"
            />
            <button className="px-4 text-blue-600" aria-label="Search">
              <Search size={20} />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-5">
            {user ? (
              <div className="group relative hidden md:block">
                <button className="flex items-center gap-1 font-medium">
                  <User size={18} />
                  {user.name.split(' ')[0]}
                  <ChevronDown size={16} />
                </button>
                <div className="invisible absolute right-0 top-full w-48 rounded-md bg-white py-2 text-sm text-gray-700 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                  {accountLinks.map((l) => (
                    <Link key={l.to} to={l.to} className="block px-4 py-2 hover:bg-gray-100">
                      {l.label}
                    </Link>
                  ))}
                  <button onClick={onLogout} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden rounded bg-white px-5 py-1.5 font-semibold text-blue-600 md:block">
                Login
              </Link>
            )}

            <Link to="/cart" className="relative flex items-center gap-1 font-medium">
              <ShoppingCart size={22} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop category bar */}
      <nav className="hidden bg-white md:block">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4 py-2 text-sm font-medium text-gray-700">
          {categories.map((c) => (
            <Link key={c._id} to={`/products?category=${c.slug}`} className="whitespace-nowrap hover:text-blue-600">
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="max-h-[70vh] overflow-y-auto border-b bg-white text-gray-700 md:hidden">
          <div className="border-b px-4 py-2">
            {user ? (
              <>
                <p className="py-2 font-semibold">Hi, {user.name}</p>
                {accountLinks.map((l) => (
                  <Link key={l.to} to={l.to} onClick={closeMenu} className="block py-2">
                    {l.label}
                  </Link>
                ))}
                <button onClick={onLogout} className="block py-2 text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-4 py-2">
                <Link to="/login" onClick={closeMenu} className="font-semibold text-blue-600">Login</Link>
                <Link to="/register" onClick={closeMenu} className="font-semibold text-blue-600">Register</Link>
              </div>
            )}
          </div>
          <div className="px-4 py-2">
            <p className="py-1 text-xs font-semibold uppercase text-gray-400">Categories</p>
            {categories.map((c) => (
              <Link key={c._id} to={`/products?category=${c.slug}`} onClick={closeMenu} className="block py-2">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}