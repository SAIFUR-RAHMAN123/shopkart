import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductForm from '../../components/admin/ProductForm';
import { createProduct } from '../../services/adminService';

export default function AddProduct() {
  const navigate = useNavigate();

  const onSubmit = async (payload) => {
    await createProduct(payload);
    toast.success('Product created');
    navigate('/admin/products');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Add product</h1>
      <ProductForm onSubmit={onSubmit} submitLabel="Create product" />
    </div>
  );
}