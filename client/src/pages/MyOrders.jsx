import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getMyOrders } from '../services/orderService';
import Spinner from '../components/Spinner';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { formatDate, formatPrice, shortId } from '../utils/format';

export default function MyOrders() {
  const { data, loading, error, reload } = useFetch(getMyOrders, []);

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="font-medium text-red-600">{error}</p>
        <button onClick={reload} className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  const orders = data.orders;
  if (!orders.length) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Package size={64} className="mx-auto text-gray-300" />
        <h1 className="mt-4 text-xl font-bold">No orders yet</h1>
        <p className="mt-1 text-sm text-gray-500">When you place an order, it will show up here.</p>
        <Link to="/products" className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-2.5 font-semibold text-white">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o._id} to={`/orders/${o._id}`} className="block rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">Order #{shortId(o._id)}</p>
                <p className="text-xs text-gray-500">Placed on {formatDate(o.createdAt)}</p>
              </div>
              <OrderStatusBadge status={o.status} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {o.items.slice(0, 3).map((i) => (
                  <img key={i.product} src={i.image} alt={i.name} className="h-14 w-14 rounded bg-gray-100 object-contain p-1" />
                ))}
                {o.items.length > 3 && <span className="text-sm text-gray-500">+{o.items.length - 3} more</span>}
              </div>
              <span className="font-bold">{formatPrice(o.totalPrice)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}