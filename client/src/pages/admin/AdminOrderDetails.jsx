import { Link, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { getAdminOrder } from '../../services/adminService';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderStatusControl from '../../components/admin/OrderStatusControl';
import { formatDateTime, formatPrice, shortId, PAYMENT_LABELS } from '../../utils/format';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => getAdminOrder(id), [id]);

  if (loading && !data) return <Spinner />;
  if (error && !data) {
    return (
      <div className="py-20 text-center">
        <p className="font-medium text-red-600">{error}</p>
        <Link to="/admin/orders" className="mt-3 inline-block font-semibold text-blue-600">Back to orders</Link>
      </div>
    );
  }

  const o = data.order;
  const a = o.shippingAddress;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link to="/admin/orders" className="text-sm font-semibold text-blue-600">‹ All orders</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order #{shortId(o._id)}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDateTime(o.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={o.status} />
          <OrderStatusControl order={o} onUpdated={reload} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="space-y-3 rounded-lg bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="font-semibold">Items</h2>
          {o.items.map((i) => (
            <div key={i.product} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
              <img src={i.image} alt={i.name} className="h-16 w-16 shrink-0 rounded bg-gray-100 object-contain p-1" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="line-clamp-2 font-medium">{i.name}</p>
                <p className="text-gray-500">{formatPrice(i.finalPrice)} × {i.quantity}</p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(i.finalPrice * i.quantity)}</span>
            </div>
          ))}
        </section>

        <div className="space-y-4">
          <section className="rounded-lg bg-white p-4 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Customer</h2>
            <p className="font-medium">{o.user?.name || 'Deleted user'}</p>
            <p className="text-gray-500">{o.user?.email}</p>
          </section>

          <section className="rounded-lg bg-white p-4 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Ship to</h2>
            <p className="font-medium">{a.fullName}</p>
            <p>{a.street}</p>
            <p>{a.city}, {a.state} {a.pincode}</p>
            <p className="mt-1 text-gray-500">Phone: {a.phone}</p>
          </section>

          <section className="rounded-lg bg-white p-4 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Payment</h2>
            <p>{PAYMENT_LABELS[o.paymentMethod]}</p>
            <p className="capitalize text-gray-500">Status: {o.paymentStatus}</p>
            <dl className="mt-3 space-y-1 border-t pt-3">
              <div className="flex justify-between"><dt>Price</dt><dd>{formatPrice(o.itemsPrice)}</dd></div>
              <div className="flex justify-between"><dt>Discount</dt><dd className="text-green-600">− {formatPrice(o.discount)}</dd></div>
              <div className="flex justify-between border-t pt-2 font-bold"><dt>Total</dt><dd>{formatPrice(o.totalPrice)}</dd></div>
            </dl>
          </section>

          <section className="rounded-lg bg-white p-4 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Status history</h2>
            <ol className="space-y-1">
              {o.statusHistory.map((h, idx) => (
                <li key={idx} className="flex justify-between gap-2">
                  <span>{h.status}</span>
                  <span className="text-gray-500">{formatDateTime(h.at)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}