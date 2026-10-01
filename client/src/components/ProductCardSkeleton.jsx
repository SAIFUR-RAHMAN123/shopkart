export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="aspect-square bg-gray-200" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-5 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}