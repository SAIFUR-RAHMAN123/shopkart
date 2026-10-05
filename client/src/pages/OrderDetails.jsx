import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFetch from '../hooks/useFetch';
import { getOrder, cancelOrder } from '../services/orderService';
import Spinner from '../components/Spinner';
import OrderStatusBadge from '../components/OrderStatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateTime, formatPrice, shortId, PAYMENT_LABELS } from '../utils/format';

export default function OrderDetails() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => getOrder(id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="font-medium text-red-600">{error}</p>
        <Link to="/orders" className="mt-3 inline-block font-semibold text-blue-600">Back to my orders</Link>
      </div>
    );
  }

  const o = data.order;
  const a = o.shippingAddress;
  const canCancel = ['Pending', 'Confirmed'].includes(o.status);

  const onCancel = async () => {
    setConfirm(false);
    setCancelling(true);
    try {
      await cancelOrder(o._id);
      toast.success('Order cancelled');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link to="/orders" className="text-sm font-semibold text-blue-600">‹ My orders</Link>
      <div className="mb-4 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order #{shortId(o._id)}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDateTime(o.createdAt)}</p>
        </div>
        <OrderStatusBadge status={o.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="space-y-3 rounded-lg bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="font-semibold">Items</h2>
          {o.items.map((i) => (
            <div key={i.product} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
              <img src={i.image} alt={i.name} className="h-16 w-16 shrink-0 rounded bg-gray-100 object-contain p-1" />
              <div className="min-w-0 flex-1 text-sm">
                <Link to={`/products/${i.product}`} className="line-clamp-2 font-medium hover:text-blue-600">{i.name}</Link>
                <p className="text-gray-500">{formatPrice(i.finalPrice)} × {i.quantity}</p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(i.finalPrice * i.quantity)}</span>
            </div>
          ))}
        </section>

        <div className="space-y-4">
          <section className="rounded-lg bg-white p-4 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Shipping address</h2>
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
              <div className="flex justify-between"><dt>Delivery</dt><dd className="text-green-600">Free</dd></div>
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

          {canCancel && (
            <button
              onClick={() => setConfirm(true)}
              disabled={cancelling}
              className="w-full rounded-md border border-red-600 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel order'}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Cancel this order?"
        message="The items will be returned to stock. This cannot be undone."
        confirmText="Yes, cancel order"
        onCancel={() => setConfirm(false)}
        onConfirm={onCancel}
      />
    </div>
  );
}