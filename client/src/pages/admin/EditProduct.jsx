import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import ProductForm from '../../components/admin/ProductForm';
import Spinner from '../../components/Spinner';
import { getAdminProduct, updateProduct } from '../../services/adminService';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => getAdminProduct(id), [id]);

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="font-medium text-red-600">{error}</p>
        <Link to="/admin/products" className="mt-3 inline-block font-semibold text-blue-600">Back to products</Link>
      </div>
    );
  }

  const onSubmit = async (payload) => {
    await updateProduct(id, payload);
    toast.success('Product updated');
    navigate('/admin/products');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Edit product</h1>
      <ProductForm initial={data.product} onSubmit={onSubmit} submitLabel="Save changes" />
    </div>
  );
}