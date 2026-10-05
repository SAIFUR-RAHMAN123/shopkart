export default function TableSkeletonRows({ cols, rows = 6 }) {
  return Array.from({ length: rows }, (_, i) => (
    <tr key={i} className="animate-pulse">
      <td colSpan={cols} className="px-4 py-4"><div className="h-8 rounded bg-gray-200" /></td>
    </tr>
  ));
}