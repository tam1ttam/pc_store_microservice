import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Supplier {
    id?: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    img?: string;
    supplier?: Supplier;
    price: number;
    unit?: string;
}

type Props = {
    product: Product;
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function ProductCard({ product }: Props) {
    return (
        <Link to={`/products/${product.id}`} className="block">
            <div className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl hover:border-blue-500/50">
                <button className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-700 shadow-lg">
                    <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>

                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                </div>

                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {product.supplier?.name ?? 'Nhà cung cấp'}
                        </span>
                        <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">4.8</span>
                        </div>
                    </div>

                    <h3 className="font-semibold text-sm mb-3 line-clamp-2 min-h-[40px] text-gray-800 dark:text-gray-100">
                        {product.name}
                    </h3>

                    <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {formatPrice(product.price ?? 0)}
                            </span>
                            {product.unit && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">/ {product.unit}</span>
                            )}
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </Link>
    );
}
