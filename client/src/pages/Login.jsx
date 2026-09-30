import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import FormField from '../components/FormField';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) {
    const dest = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/');
    return <Navigate to={dest} replace />;
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Login</h1>
        <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
        <button disabled={loading} className="w-full rounded-md bg-orange-500 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <p className="text-center text-sm text-gray-600">
          New to ShopKart? <Link to="/register" className="font-semibold text-blue-600">Create an account</Link>
        </p>
      </form>
    </div>
  );
}