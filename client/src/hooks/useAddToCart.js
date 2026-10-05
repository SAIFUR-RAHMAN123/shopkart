import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function useAddToCart() {
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const location = useLocation();

  return async (productId, quantity = 1) => {
    if (!user) {
      toast('Please login to add items to your cart');
      navigate('/login', { state: { from: location } });
      return false;
    }
    try {
      await addItem(productId, quantity);
      toast.success('Added to cart');
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };
}