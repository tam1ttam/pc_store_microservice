import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProductCardBubbleProps {
    product: {
        productId: string;
        name: string;
        price: number;
        image: string;
        slug: string;
    };
    isMe: boolean;
}

export const ProductCardBubble = ({ product, isMe }: ProductCardBubbleProps) => {
    const { t } = useTranslation();

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className={cn(
            "flex flex-col gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-[200px] shadow-sm",
        )}>
            <Link to={`/products/${product.slug}`} className="block overflow-hidden rounded-md">
                <img src={product.image} alt={product.name} className="w-full h-32 object-cover hover:scale-105 transition-transform" />
            </Link>
            <div className="flex flex-col gap-1">
                <h4 className="text-xs font-semibold line-clamp-2 h-8">{product.name}</h4>
                <p className="text-sm font-bold text-orange-600">{formatPrice(product.price)}</p>
                <Link
                    to={`/products/${product.slug}`}
                    className="text-[10px] text-blue-500 hover:underline text-center mt-1"
                >
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
};
