import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, Users, Store, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-slate-900 text-slate-300 md:w-60 md:shrink-0">
        <div className="px-4 py-4 text-lg font-bold text-white">ShopKart Admin</div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <Link to="/" className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-slate-800 md:mt-4">
            <Store size={18} /> Back to store
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm hover:bg-slate-800"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}