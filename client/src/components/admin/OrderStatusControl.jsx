import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../ConfirmDialog';
import { updateOrderStatus } from '../../services/adminService';
import { NEXT_STATUSES } from '../../utils/orderStatus';

export default function OrderStatusControl({ order, onUpdated }) {
  const next = NEXT_STATUSES[order.status] || [];
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const apply = async (status) => {
    setBusy(true);
    try {
      await updateOrderStatus(order._id, status);
      toast.success(`Order marked ${status}`);
      onUpdated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onChange = (e) => {
    const status = e.target.value;
    if (!status) return;
    if (status === 'Cancelled') setConfirmCancel(true);
    else apply(status);
  };

  if (!next.length) return <span className="text-xs text-gray-400">Final</span>;

  return (
    <>
      <select
        value=""
        onChange={onChange}
        disabled={busy}
        aria-label="Update status"
        className="rounded-md border bg-white px-2 py-1 text-sm disabled:opacity-50"
      >
        <option value="">Update status</option>
        {next.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="Items return to stock and paid orders are marked refunded. This cannot be undone."
        confirmText="Cancel order"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => { setConfirmCancel(false); apply('Cancelled'); }}
      />
    </>
  );
}