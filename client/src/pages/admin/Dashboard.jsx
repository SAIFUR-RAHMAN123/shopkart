import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Package, Users, Clock } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getStats } from '../../services/adminService';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { formatDate, formatPrice, shortId } from '../../utils/format';

function StatCard({ icon: Icon, label, value, tone, to }) {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper to={to} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="truncate text-xl font-bold">{value}</p>
      </div>
    </Wrapper>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-24 rounded-lg bg-gray-200" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-72 rounded-lg bg-gray-200 lg:col-span-2" />
        <div className="h-72 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(getStats, []);

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="font-medium text-red-600">{error}</p>
        <button onClick={reload} className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  const s = data.stats;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={IndianRupee} label="Total revenue" value={formatPrice(s.totalRevenue)} tone="bg-green-100 text-green-600" />
        <StatCard icon={ShoppingBag} label="Total orders" value={s.totalOrders} tone="bg-blue-100 text-blue-600" to="/admin/orders" />
        <StatCard icon={Clock} label="Pending orders" value={s.pendingOrders} tone="bg-yellow-100 text-yellow-600" to="/admin/orders" />
        <StatCard icon={Package} label="Products" value={s.totalProducts} tone="bg-purple-100 text-purple-600" to="/admin/products" />
        <StatCard icon={Users} label="Users" value={s.totalUsers} tone="bg-orange-100 text-orange-600" to="/admin/users" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-blue-600">View all</Link>
          </div>
          {s.recentOrders.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Order</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {s.recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/admin/orders/${o._id}`} className="font-semibold text-blue-600">#{shortId(o._id)}</Link>
                      </td>
                      <td className="px-4 py-3">{o.user?.name || 'Deleted user'}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(o.totalPrice)}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Low stock</h2>
            <span className="text-xs text-gray-500">≤ {s.lowStockThreshold} units</span>
          </div>
          {s.lowStockProducts.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">All products are well stocked</p>
          ) : (
            <ul className="divide-y">
              {s.lowStockProducts.map((p) => (
                <li key={p._id}>
                  <Link to={`/admin/products/${p._id}/edit`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                    <img src={p.images[0]} alt="" className="h-10 w-10 shrink-0 rounded bg-gray-100 object-contain p-0.5" />
                    <span className="line-clamp-1 flex-1 text-sm">{p.name}</span>
                    <span className={`shrink-0 text-xs font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}