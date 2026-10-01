import { useSearchParams } from 'react-router-dom';
import ProductListing from '../components/ProductListing';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q')?.trim() || '';

  if (!q) {
    return <p className="py-20 text-center text-gray-600">Type something in the search bar to find products.</p>;
  }
  return <ProductListing title={`Results for "${q}"`} fixed={{ search: q }} />;
}