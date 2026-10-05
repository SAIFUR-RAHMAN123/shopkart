import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getOrder } from '../services/orderService';
import Spinner from '../components/Spinner';
import { formatDate, formatPrice, shortId, PAYMENT_LABELS } from '../utils/format';

export default function OrderSuccess() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => getOrder(id), [id]);

  if (loading) return <Spinner />;
  if (error) return <p className="py-20 text-center font-medium text-red-600">{error}</p>;

  const o = data.order;
  const eta = new Date(new Date(o.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <CheckCircle size={72} className="mx-auto text-green-500" />
      <h1 className="mt-4 text-2xl font-bold">Order placed successfully!</h1>
      <p className="mt-1 text-gray-600">Thank you for shopping with ShopKart.</p>

      <dl className="mt-6 space-y-2 rounded-lg bg-white p-5 text-left text-sm shadow-sm">
        <div className="flex justify-between"><dt className="text-gray-500">Order ID</dt><dd className="font-semibold">#{shortId(o._id)}</dd></div>
        <div className="flex justify-between"><dt className="text-gray-500">Total</dt><dd className="font-semibold">{formatPrice(o.totalPrice)}</dd></div>
        <div className="flex justify-between"><dt className="text-gray-500">Payment</dt><dd>{PAYMENT_LABELS[o.paymentMethod]}</dd></div>
        <div className="flex justify-between"><dt className="text-gray-500">Estimated delivery</dt><dd>{formatDate(eta)}</dd></div>
      </dl>

      <div className="mt-6 flex justify-center gap-3">
        <Link to={`/orders/${o._id}`} className="rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white">View order</Link>
        <Link to="/products" className="rounded-md border bg-white px-5 py-2.5 font-semibold">Continue shopping</Link>
      </div>
    </div>
  );
}