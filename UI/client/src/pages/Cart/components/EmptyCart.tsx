import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function EmptyCart() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <ShoppingCart className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{t('cart.emptyTitle')}</h3>
      <p className="text-gray-500 mb-6">{t('cart.emptyCartDesc')}</p>
      <button onClick={() => navigate('/products')} className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
        {t('cart.continueShopping')}
      </button>
    </div>
  );
}
