import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAdminUsers, setUserActive } from '../../services/adminService';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import TableSkeletonRows from '../../components/admin/TableSkeletonRows';
import { formatDate } from '../../utils/format';

export default function ManageUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = Object.fromEntries(searchParams);
  const [search, setSearch] = useState(query.search || '');
  const [toDeactivate, setToDeactivate] = useState(null);

  const { data, loading, error, reload } = useFetch(
    () => getAdminUsers({ limit: 10, ...query }),
    [searchParams.toString()]
  );

  const update = (changes, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const changeActive = async (user, isActive) => {
    try {
      await setUserActive(user._id, isActive);
      toast.success(isActive ? 'User activated' : 'User deactivated');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const th = 'px-4 py-2';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); update({ search: search.trim() }); }}
          className="flex min-w-48 flex-1 overflow-hidden rounded-md border bg-white"
        >
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className="w-full px-3 py-2 text-sm outline-none" />
          <button className="px-3 text-gray-500" aria-label="Search"><Search size={18} /></button>
        </form>
        <select value={query.status || ''} onChange={(e) => update({ status: e.target.value })} className="rounded-md border bg-white px-3 py-2 text-sm">
          <option value="">All users</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      {error && !data ? (
        <div className="rounded-lg bg-white py-12 text-center">
          <p className="font-medium text-red-600">{error}</p>
          <button onClick={reload} className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg bg-white shadow-sm ${loading && data ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className={th}>Name</th><th className={th}>Email</th><th className={th}>Role</th>
                <th className={th}>Joined</th><th className={th}>Status</th><th className={th}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!data ? (
                <TableSkeletonRows cols={6} />
              ) : data.users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No users found</td></tr>
              ) : (
                data.users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : u.isActive ? (
                        <button onClick={() => setToDeactivate(u)} className="text-sm font-semibold text-red-600">Deactivate</button>
                      ) : (
                        <button onClick={() => changeActive(u, true)} className="text-sm font-semibold text-green-600">Activate</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <>
          <p className="text-sm text-gray-500">{data.pagination.total} users</p>
          <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={(n) => update({ page: n === 1 ? '' : n }, false)} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDeactivate)}
        title="Deactivate user?"
        message={`${toDeactivate?.name} will be signed out and won't be able to log in until you reactivate the account.`}
        confirmText="Deactivate"
        onCancel={() => setToDeactivate(null)}
        onConfirm={() => { const u = toDeactivate; setToDeactivate(null); changeActive(u, false); }}
      />
    </div>
  );
}