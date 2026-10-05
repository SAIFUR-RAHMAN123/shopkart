import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAdminProducts, updateProduct, deleteProduct } from '../../services/adminService';
import { getCategories } from '../../services/categoryService';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatPrice } from '../../utils/format';

function StockCell({ product, onSave }) {
  const [value, setValue] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(String(product.stock)), [product.stock]);
  const dirty = value !== String(product.stock);

  const save = async () => {
    const n = Number(value);
    if (value === '' || !Number.isInteger(n) || n < 0) {
      toast.error('Stock must be a non-negative whole number');
      return setValue(String(product.stock));
    }
    setSaving(true);
    try {
      await onSave(product._id, { stock: n });
      toast.success('Stock updated');
    } catch (err) {
      toast.error(err.message);
      setValue(String(product.stock));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && dirty && save()}
        className={`w-16 rounded border px-2 py-1 text-sm ${product.stock <= 5 ? 'border-orange-400' : 'border-gray-300'}`}
      />
      {dirty && (
        <button onClick={save} disabled={saving} className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">
          Save
        </button>
      )}
    </div>
  );
}

export default function ManageProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = Object.fromEntries(searchParams);
  const [search, setSearch] = useState(query.search || '');
  const [toDelete, setToDelete] = useState(null);

  const { data, loading, error, reload } = useFetch(
    () => getAdminProducts({ limit: 10, ...query }),
    [searchParams.toString()]
  );
  const { data: catData } = useFetch(getCategories, []);

  const update = (changes, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const saveField = async (id, changes) => {
    await updateProduct(id, changes);
    reload();
  };

  const toggleActive = async (p) => {
    try {
      await saveField(p._id, { isActive: !p.isActive });
      toast.success(p.isActive ? 'Product hidden from store' : 'Product is now active');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    const p = toDelete;
    setToDelete(null);
    try {
      await deleteProduct(p._id);
      toast.success('Product deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const th = 'px-4 py-2';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={16} /> Add product
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); update({ search: search.trim() }); }}
          className="flex min-w-48 flex-1 overflow-hidden rounded-md border bg-white"
        >
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or brand" className="w-full px-3 py-2 text-sm outline-none" />
          <button className="px-3 text-gray-500" aria-label="Search"><Search size={18} /></button>
        </form>
        <select value={query.category || ''} onChange={(e) => update({ category: e.target.value })} className="rounded-md border bg-white px-3 py-2 text-sm">
          <option value="">All categories</option>
          {catData?.categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={query.status || ''} onChange={(e) => update({ status: e.target.value })} className="rounded-md border bg-white px-3 py-2 text-sm">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={query.stock === 'low'} onChange={(e) => update({ stock: e.target.checked ? 'low' : '' })} />
          Low stock
        </label>
      </div>

      {error && !data ? (
        <div className="rounded-lg bg-white py-12 text-center">
          <p className="font-medium text-red-600">{error}</p>
          <button onClick={reload} className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg bg-white shadow-sm ${loading && data ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className={th}>Image</th><th className={th}>Name</th><th className={th}>Category</th>
                <th className={th}>Price</th><th className={th}>Stock</th><th className={th}>Status</th><th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!data
                ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-4 py-4"><div className="h-8 rounded bg-gray-200" /></td>
                    </tr>
                  ))
                : data.products.length === 0
                ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No products match your filters</td></tr>
                  )
                : data.products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <img src={p.images[0]} alt="" className="h-12 w-12 rounded bg-gray-100 object-contain p-0.5" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="line-clamp-1 max-w-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.brand}</p>
                      </td>
                      <td className="px-4 py-3">{p.category?.name || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium">{formatPrice(p.finalPrice)}</p>
                        {p.discount > 0 && <p className="text-xs text-gray-500 line-through">{formatPrice(p.price)}</p>}
                      </td>
                      <td className="px-4 py-3"><StockCell product={p} onSave={saveField} /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(p)}
                          title="Click to toggle"
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/admin/products/${p._id}/edit`} className="text-blue-600" aria-label="Edit"><Pencil size={16} /></Link>
                          <button onClick={() => setToDelete(p)} className="text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <>
          <p className="text-sm text-gray-500">{data.pagination.total} products</p>
          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            onChange={(n) => update({ page: n === 1 ? '' : n }, false)}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product?"
        message={`"${toDelete?.name}" will be permanently deleted. Existing orders keep their own copy of the product details.`}
        confirmText="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}