import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-7xl font-extrabold text-blue-600">404</p>
      <h1 className="mt-4 text-xl font-bold">Page not found</h1>
      <p className="mt-1 text-sm text-gray-500">The page you're looking for doesn't exist or has moved.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white">Go home</Link>
        <Link to="/products" className="rounded-md border bg-white px-5 py-2.5 font-semibold">Browse products</Link>
      </div>
    </div>
  );
}