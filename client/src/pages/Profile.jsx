import { useState } from 'react';
import toast from 'react-hot-toast';
import FormField from '../components/FormField';
import { useAuthStore } from '../store/authStore';
import { updateProfile, changePassword } from '../services/authService';

const serverErrors = (err) => Object.fromEntries((err.errors || []).map((x) => [x.field.split('.').pop(), x.message]));
const btn = 'rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60';

function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    pincode: user.address?.pincode || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const { name, phone, street, city, state, pincode } = form;
      const { user: updated } = await updateProfile({ name, phone, address: { street, city, state, pincode } });
      setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      setErrors(serverErrors(err));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Personal information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} />
        <FormField label="Email" value={user.email} disabled readOnly />
        <FormField label="Mobile number" name="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={onChange} error={errors.phone} />
      </div>
      <h3 className="pt-2 font-semibold">Default shipping address</h3>
      <FormField label="Address" name="street" value={form.street} onChange={onChange} error={errors.street} />
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="City" name="city" value={form.city} onChange={onChange} error={errors.city} />
        <FormField label="State" name="state" value={form.state} onChange={onChange} error={errors.state} />
        <FormField label="Pincode" name="pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={onChange} error={errors.pincode} />
      </div>
      <button disabled={saving} className={btn}>{saving ? 'Saving...' : 'Save changes'}</button>
    </form>
  );
}

function PasswordForm() {
  const empty = { currentPassword: '', newPassword: '', confirm: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    if (form.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    else if (form.newPassword === form.currentPassword) errs.newPassword = 'New password must be different';
    if (form.confirm !== form.newPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated');
      setForm(empty);
    } catch (err) {
      setErrors(serverErrors(err));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Change password</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Current password" name="currentPassword" type="password" value={form.currentPassword} onChange={onChange} error={errors.currentPassword} />
        <FormField label="New password" name="newPassword" type="password" value={form.newPassword} onChange={onChange} error={errors.newPassword} />
        <FormField label="Confirm new password" name="confirm" type="password" value={form.confirm} onChange={onChange} error={errors.confirm} />
      </div>
      <button disabled={saving} className={btn}>{saving ? 'Updating...' : 'Update password'}</button>
    </form>
  );
}

export default function Profile() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}