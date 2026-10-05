import { useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import FormField from '../../components/FormField';
import Spinner from '../../components/Spinner';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function ManageCategories() {
  const { data, loading, error, reload } = useFetch(getCategories, []);
  const [form, setForm] = useState({ name: '', image: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const resetForm = () => {
    setForm({ name: '', image: '' });
    setEditId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), image: form.image.trim() };
      if (editId) await updateCategory(editId, payload);
      else await createCategory(payload);
      toast.success(editId ? 'Category updated' : 'Category added');
      resetForm();
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const c = toDelete;
    setToDelete(null);
    try {
      await deleteCategory(c._id);
      toast.success('Category deleted');
      reload();
    } catch (err) {
      toast.error(err.message); // e.g. "Category still has products"
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>

      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-sm">
        <div className="min-w-40 flex-1">
          <FormField label={editId ? 'Edit category name' : 'New category name'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="min-w-56 flex-[2]">
          <FormField label="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>
        <button disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {editId ? 'Save' : 'Add'}
        </button>
        {editId && <button type="button" onClick={resetForm} className="rounded-md border px-4 py-2 text-sm font-semibold">Cancel</button>}
      </form>

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <p className="py-10 text-center font-medium text-red-600">{error}</p>
      ) : (
        <ul className="divide-y rounded-lg bg-white shadow-sm">
          {data.categories.length === 0 && <li className="p-6 text-center text-sm text-gray-500">No categories yet</li>}
          {data.categories.map((c) => (
            <li key={c._id} className="flex items-center gap-3 p-3">
              {c.image ? (
                <img src={c.image} alt="" className="h-10 w-10 rounded bg-gray-100 object-contain p-0.5" />
              ) : (
                <div className="h-10 w-10 rounded bg-gray-100" />
              )}
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-gray-500">/{c.slug}</p>
              </div>
              <button
                onClick={() => { setEditId(c._id); setForm({ name: c.name, image: c.image || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-blue-600"
                aria-label="Edit"
              >
                <Pencil size={16} />
              </button>
              <button onClick={() => setToDelete(c)} className="text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete category?"
        message={`"${toDelete?.name}" will be deleted. Categories that still have products can't be deleted.`}
        confirmText="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}