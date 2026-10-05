import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getCategories } from '../../services/categoryService';
import FormField from '../FormField';
import { formatPrice } from '../../utils/format';

const inputCls = (err) =>
  `w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-500' : 'border-gray-300'}`;

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const isHttpUrl = (s) => {
  try {
    return ['http:', 'https:'].includes(new URL(s).protocol);
  } catch {
    return false;
  }
};

const toForm = (p) => ({
  name: p?.name || '',
  brand: p?.brand || '',
  category: p?.category?._id || '',
  description: p?.description || '',
  price: p?.price ?? '',
  discount: p?.discount ?? 0,
  stock: p?.stock ?? 0,
  images: (p?.images || []).join('\n'),
  featured: p?.featured || false,
  isActive: p?.isActive ?? true,
  specifications: (p?.specifications || []).map(({ key, value }) => ({ key, value })),
});

const imageList = (form) => form.images.split('\n').map((s) => s.trim()).filter(Boolean);

const validate = (f) => {
  const e = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!f.brand.trim()) e.brand = 'Brand is required';
  if (!f.category) e.category = 'Select a category';
  if (!f.description.trim()) e.description = 'Description is required';
  if (f.price === '' || Number(f.price) < 0) e.price = 'Enter a valid price';
  if (Number(f.discount) < 0 || Number(f.discount) > 90) e.discount = 'Discount must be 0-90';
  if (f.stock === '' || !Number.isInteger(Number(f.stock)) || Number(f.stock) < 0) e.stock = 'Stock must be a whole number ≥ 0';
  const imgs = imageList(f);
  if (!imgs.length) e.images = 'Add at least one image URL';
  else if (!imgs.every(isHttpUrl)) e.images = 'Every line must be a valid http(s) URL';
  return e;
};

export default function ProductForm({ initial, onSubmit, submitLabel }) {
  const { data: catData } = useFetch(getCategories, []);
  const [form, setForm] = useState(() => toForm(initial));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const onChange = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
  const setSpec = (i, key, value) =>
    setForm((f) => ({ ...f, specifications: f.specifications.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)) }));

  const finalPrice = form.price !== '' ? Math.round(Number(form.price) * (1 - Number(form.discount || 0) / 100)) : null;

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error('Please fix the highlighted fields');

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        description: form.description.trim(),
        price: Number(form.price),
        discount: Number(form.discount || 0),
        stock: Number(form.stock),
        images: imageList(form),
        featured: form.featured,
        isActive: form.isActive,
        specifications: form.specifications.filter((s) => s.key.trim() && s.value.trim()),
      });
    } catch (err) {
      if (err.errors) setErrors(Object.fromEntries(err.errors.map((x) => [x.field.split('.')[0], x.message])));
      toast.error(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="grid gap-4 rounded-lg bg-white p-5 shadow-sm md:grid-cols-2">
        <FormField label="Product name" name="name" value={form.name} onChange={onChange} error={errors.name} />
        <FormField label="Brand" name="brand" value={form.brand} onChange={onChange} error={errors.brand} />
        <Field label="Category" error={errors.category}>
          <select name="category" value={form.category} onChange={onChange} className={inputCls(errors.category)}>
            <option value="">Select category</option>
            {catData?.categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Price (MRP ₹)" name="price" type="number" min="0" value={form.price} onChange={onChange} error={errors.price} />
          <FormField label="Discount %" name="discount" type="number" min="0" max="90" value={form.discount} onChange={onChange} error={errors.discount} />
          <FormField label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={onChange} error={errors.stock} />
        </div>
        {finalPrice !== null && (
          <p className="text-sm text-gray-600 md:col-span-2">
            Selling price: <span className="font-semibold">{formatPrice(finalPrice)}</span>
          </p>
        )}
        <div className="md:col-span-2">
          <Field label="Description" error={errors.description}>
            <textarea name="description" rows={4} value={form.description} onChange={onChange} className={inputCls(errors.description)} />
          </Field>
        </div>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <Field label="Image URLs (one per line, first is the main image)" error={errors.images}>
          <textarea name="images" rows={4} value={form.images} onChange={onChange} placeholder="https://..." className={inputCls(errors.images)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          {imageList(form).filter(isHttpUrl).map((url, i) => (
            <img key={i} src={url} alt="" className="h-16 w-16 rounded border bg-gray-100 object-contain p-1" />
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700">Specifications</h2>
        {form.specifications.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input placeholder="Name (e.g. Warranty)" value={s.key} onChange={(e) => setSpec(i, 'key', e.target.value)} className={inputCls(false)} />
            <input placeholder="Value" value={s.value} onChange={(e) => setSpec(i, 'value', e.target.value)} className={inputCls(false)} />
            <button
              type="button"
              aria-label="Remove specification"
              onClick={() => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }))}
              className="text-gray-400 hover:text-red-600"
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }))}
          className="flex items-center gap-1 text-sm font-semibold text-blue-600"
        >
          <Plus size={16} /> Add specification
        </button>
      </section>

      <section className="flex flex-wrap gap-6 rounded-lg bg-white p-5 shadow-sm">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" checked={form.featured} onChange={onChange} /> Featured on home page
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} /> Active (visible to customers)
        </label>
      </section>

      <div className="flex justify-end gap-3">
        <Link to="/admin/products" className="rounded-md border bg-white px-5 py-2.5 text-sm font-semibold">Cancel</Link>
        <button disabled={saving} className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}