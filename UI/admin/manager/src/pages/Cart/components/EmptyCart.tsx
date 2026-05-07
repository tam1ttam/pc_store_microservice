import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <ShoppingCart className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h3>
      <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
      <button onClick={() => navigate('/products')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
        Tiếp tục mua sắm
      </button>
    </div>
  );
}
