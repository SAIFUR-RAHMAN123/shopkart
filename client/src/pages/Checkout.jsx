import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { createOrder } from '../services/orderService';
import { formatPrice } from '../utils/format';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', hint: 'Pay when your order arrives' },
  { value: 'demo', label: 'Demo Payment', hint: 'Simulated online payment. No real money is charged.' },
];

const validate = (f) => {
  const e = {};
  if (!f.fullName.trim()) e.fullName = 'Full name is required';
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';
  if (!f.street.trim()) e.street = 'Address is required';
  if (!f.city.trim()) e.city = 'City is required';
  if (!f.state.trim()) e.state = 'State is required';
  if (!/^\d{6}$/.test(f.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
  return e;
};

export default function Checkout() {
  const user = useAuthStore((s) => s.user);
  const { cart, loaded, fetchCart } = useCartStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user.name || '',
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    pincode: user.address?.pincode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);

  const { items, summary } = cart;

  if (!loaded) return <Spinner />;
  if (!items.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Link to="/products" className="mt-4 inline-block font-semibold text-blue-600">Continue shopping</Link>
      </div>
    );
  }

  const hasStockIssue = items.some(
    ({ product, quantity }) => product.stock < quantity
  );
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error('Please fix the highlighted fields');

    setPlacing(true);
    try {
      const { order } = await createOrder({ shippingAddress: form, paymentMethod });
      navigate(`/order-success/${order._id}`, { replace: true });
      fetchCart(); // server emptied the cart; sync the store
    } catch (err) {
      if (err.errors) {
        setErrors(Object.fromEntries(err.errors.map((x) => [x.field.split('.').pop(), x.message])));
      }
      toast.error(err.message);
      fetchCart(); // stock may have changed
      setPlacing(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} />
            <FormField label="Mobile number" name="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={onChange} error={errors.phone} />
          </div>
          <FormField label="Address (house no., street, area)" name="street" value={form.street} onChange={onChange} error={errors.street} />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="City" name="city" value={form.city} onChange={onChange} error={errors.city} />
            <FormField label="State" name="state" value={form.state} onChange={onChange} error={errors.state} />
            <FormField label="Pincode" name="pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={onChange} error={errors.pincode} />
          </div>
        </section>

        <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Payment method</h2>
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.value}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${paymentMethod === m.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
            >
              <input type="radio" name="payment" className="mt-1" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
              <span>
                <span className="block font-medium">{m.label}</span>
                <span className="text-sm text-gray-500">{m.hint}</span>
              </span>
            </label>
          ))}
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-lg bg-white p-5 shadow-sm lg:sticky lg:top-32">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Order summary</h2>
        <ul className="max-h-60 space-y-3 overflow-y-auto">
          {items.map(({ product, quantity }) => {
            const lineTotal = product.finalPrice * quantity;
            const inStock = product.stock >= quantity;

            return (
              <li key={product._id} className="flex gap-3 text-sm">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="h-12 w-12 shrink-0 rounded bg-gray-100 object-contain p-1"
                />

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1">{product.name}</p>

                  <p className="text-xs text-gray-500">
                    Qty {quantity}
                  </p>

                  {!inStock && (
                    <p className="text-xs font-medium text-red-600">
                      Not enough stock
                    </p>
                  )}
                </div>

                <span className="font-medium">
                  {formatPrice(lineTotal)}
                </span>
              </li>
            );
          })}
        </ul>
        <dl className="space-y-2 border-t pt-3 text-sm">
          <div className="flex justify-between"><dt>Price ({summary.itemCount} items)</dt><dd>{formatPrice(summary.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Discount</dt><dd className="text-green-600">− {formatPrice(summary.discount)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd className="text-green-600">Free</dd></div>
          <div className="flex justify-between border-t border-dashed pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(summary.total)}</dd></div>
        </dl>
        {hasStockIssue && (
          <p className="text-sm text-red-600">
            Some items are low on stock. <Link to="/cart" className="font-semibold underline">Review your cart</Link>
          </p>
        )}
        <button
          disabled={placing || hasStockIssue}
          className="w-full rounded-md bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placing ? 'Placing order...' : 'Place order'}
        </button>
      </aside>
    </form>
  );
}