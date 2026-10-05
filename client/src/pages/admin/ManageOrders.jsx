import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAdminOrders } from '../../services/adminService';
import Pagination from '../../components/Pagination';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderStatusControl from '../../components/admin/OrderStatusControl';
import TableSkeletonRows from '../../components/admin/TableSkeletonRows';
import { ORDER_STATUSES } from '../../utils/orderStatus';
import { formatDate, formatPrice, shortId, PAYMENT_LABELS } from '../../utils/format';

export default function ManageOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = Object.fromEntries(searchParams);
  const [search, setSearch] = useState(query.search || '');

  const { data, loading, error, reload } = useFetch(
    () => getAdminOrders({ limit: 10, ...query }),
    [searchParams.toString()]
  );

  const update = (changes, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const th = 'px-4 py-2';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); update({ search: search.trim() }); }}
          className="flex min-w-48 flex-1 overflow-hidden rounded-md border bg-white"
        >
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID, customer name or email" className="w-full px-3 py-2 text-sm outline-none" />
          <button className="px-3 text-gray-500" aria-label="Search"><Search size={18} /></button>
        </form>
        <select value={query.status || ''} onChange={(e) => update({ status: e.target.value })} className="rounded-md border bg-white px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && !data ? (
        <div className="rounded-lg bg-white py-12 text-center">
          <p className="font-medium text-red-600">{error}</p>
          <button onClick={reload} className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg bg-white shadow-sm ${loading && data ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Items</th>
                <th className={th}>Amount</th><th className={th}>Payment</th><th className={th}>Status</th>
                <th className={th}>Date</th><th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!data ? (
                <TableSkeletonRows cols={8} />
              ) : data.orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No orders match your filters</td></tr>
              ) : (
                data.orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${o._id}`} className="font-semibold text-blue-600">#{shortId(o._id)}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.user?.name || 'Deleted user'}</p>
                      <p className="text-xs text-gray-500">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">{o.items.length}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{formatPrice(o.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <p>{PAYMENT_LABELS[o.paymentMethod]}</p>
                      <p className="text-xs capitalize text-gray-500">{o.paymentStatus}</p>
                    </td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/admin/orders/${o._id}`} className="font-semibold text-blue-600">View</Link>
                        <OrderStatusControl order={o} onUpdated={reload} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <>
          <p className="text-sm text-gray-500">{data.pagination.total} orders</p>
          <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={(n) => update({ page: n === 1 ? '' : n }, false)} />
        </>
      )}
    </div>
  );
}