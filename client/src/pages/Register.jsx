import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FormField from '../components/FormField';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const user = useAuthStore((s) => s.user);
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created!');
    } catch (err) {
      if (err.errors) setErrors(Object.fromEntries(err.errors.map((x) => [x.field, x.message])));
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Create account</h1>
        <FormField label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
        <FormField label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={onChange} error={errors.confirm} />
        <button disabled={loading} className="w-full rounded-md bg-orange-500 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
          {loading ? 'Creating...' : 'Register'}
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}