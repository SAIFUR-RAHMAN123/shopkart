import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import PriceTag from '../components/PriceTag';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { cart, loading, loaded, error, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const [busyId, setBusyId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const { items, summary } = cart;

  const run = async (id, fn, successMsg) => {
    setBusyId(id);
    try {
      await fn();
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if ((loading || !loaded) && !items.length) return <Spinner />;

  if (error && !items.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-medium text-red-600">{error}</p>
        <button onClick={fetchCart} className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300" />
        <h1 className="mt-4 text-xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-gray-500">Add items to it now.</p>
        <Link to="/products" className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-2.5 font-semibold text-white">
          Shop now
        </Link>
      </div>
    );
  }

  const hasStockIssue = items.some(
    ({ product, quantity }) => product.stock < quantity
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Cart ({summary.itemCount})</h1>
        <button onClick={() => setConfirmClear(true)} className="text-sm font-semibold text-red-600">Clear cart</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map(({ product, quantity }) => {
            const busy = busyId === product._id;
            const maxQty = Math.min(product.stock, 10);
            const inStock = product.stock >= quantity;
            const lineTotal = product.finalPrice * quantity;
            return (
              <div key={product._id} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm">
                <Link to={`/products/${product.slug}`} className="h-24 w-24 shrink-0 rounded bg-gray-100 sm:h-28 sm:w-28">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="h-full w-full object-contain p-2"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div>
                    <Link to={`/products/${product.slug}`} className="line-clamp-2 font-medium hover:text-blue-600">
                      {product.name}
                    </Link>
                    <p className="text-xs uppercase text-gray-500">{product.brand}</p>
                  </div>
                  <PriceTag price={product.price} finalPrice={product.finalPrice} discount={product.discount} />
                  {!inStock && (
                    <p className="text-sm font-medium text-red-600">
                      {product.stock === 0
                        ? 'Out of stock. Remove this item to continue.'
                        : `Only ${product.stock} left. Reduce the quantity to continue.`}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center rounded-md border">
                        <button
                          onClick={() =>
                            run(product._id, () =>
                              updateItem(product._id, Math.max(1, quantity - 1))
                            )
                          }
                          disabled={busy || quantity <= 1}
                          className="p-2 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => run(product._id, () => updateItem(product._id, quantity + 1))}
                          disabled={busy || quantity >= maxQty}
                          className="p-2 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => run(product._id, () => removeItem(product._id), 'Item removed')}
                        disabled={busy}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                    <span className="font-bold">{formatPrice(lineTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-lg bg-white p-4 shadow-sm lg:sticky lg:top-32">
          <h2 className="border-b pb-3 text-sm font-semibold uppercase text-gray-500">Price details</h2>
          <dl className="space-y-3 py-4 text-sm">
            <div className="flex justify-between">
              <dt>Price ({summary.itemCount} item{summary.itemCount > 1 ? 's' : ''})</dt>
              <dd>{formatPrice(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd className="text-green-600">− {formatPrice(summary.discount)}</dd>
            </div>
            <div className="flex justify-between border-t border-dashed pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(summary.total)}</dd>
            </div>
          </dl>
          {summary.discount > 0 && (
            <p className="mb-3 text-sm font-medium text-green-600">You will save {formatPrice(summary.discount)} on this order</p>
          )}
          {hasStockIssue ? (
            <button disabled className="w-full cursor-not-allowed rounded-md bg-orange-500 py-3 font-semibold text-white opacity-50">
              Fix stock issues to continue
            </button>
          ) : (
            <Link to="/checkout" className="block w-full rounded-md bg-orange-500 py-3 text-center font-semibold text-white hover:bg-orange-600">
              Proceed to checkout
            </Link>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear cart?"
        message="All items will be removed from your cart."
        confirmText="Clear cart"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          run('all', clearCart, 'Cart cleared');
        }}
      />
    </div>
  );
}