import { ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
  savings: number;
  shipping: number;
  grandTotal: number;
  onCheckout: () => void;
}

export default function CartSummary({
  totalItems,
  subtotal,
  savings,
  shipping,
  grandTotal,
  onCheckout,
}: CartSummaryProps) {
  const { t } = useTranslation();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{t('cart.summaryTitle')}</h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>{t('cart.summarySubtotal', { count: totalItems })}</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>{t('cart.savings')}</span>
            <span className="text-green-600">-{formatPrice(savings)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>{t('cart.shippingFee')}</span>
          <span className="text-green-600">{shipping === 0 ? t('cart.freeShipping') : formatPrice(shipping)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
          <span>{t('cart.grandTotal')}</span>
          <span className="text-orange-600">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-5 h-5" /> {t('cart.checkout')}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        {t('cart.freeShippingNote')}
      </p>
    </div>
  );
}
