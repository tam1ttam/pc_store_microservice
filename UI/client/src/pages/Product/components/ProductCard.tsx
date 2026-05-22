import { useState } from 'react';
import { ShoppingCart, Heart, Star, Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getCart, upsertCartItem } from '@/redux/thunks/cart';
import { useToast } from '@/hooks/use-toast';

interface Supplier {
    id?: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    img?: string;
    supplier?: Supplier;
    priceAfterDiscount: number;
    originalPrice?: number;
    priceDiscount?: number;
    discountPercent?: number;
}

type Props = {
    product: Product;
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function ProductCard({ product }: Props) {
    const dispatch = useDispatch<any>();
    const { info: user } = useSelector((state: RootState) => state.user);
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const { toast } = useToast();
    const navigate = useNavigate();
    const [adding, setAdding] = useState<'idle' | 'loading' | 'done'>('idle');

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (adding === 'loading') return;
        if (!user) {
            toast({ title: 'Thông báo', description: 'Vui lòng đăng nhập để mua hàng' });
            navigate('/login');
            return;
        }

        const existing = cartItems.find((i) => i.productId === product.id);
        const newQty = (existing?.quantity ?? 0) + 1;

        setAdding('loading');
        try {
            await dispatch(upsertCartItem({
                productId: product.id,
                productName: product.name,
                productPrice: product.priceAfterDiscount,
                quantity: newQty,
                productImage: product.img,
            })).unwrap();
            dispatch(getCart());
            setAdding('done');
            setTimeout(() => setAdding('idle'), 1500);
        } catch (error: any) {
            setAdding('idle');
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error?.response?.data?.message ?? 'Không thể thêm vào giỏ hàng',
            });
        }
    };

    return (
        <Link to={`/products/${product.id}`} className="block">
            <div className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl hover:border-orange-500/50">
                {typeof product.discountPercent === 'number' && product.discountPercent > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                        -{product.discountPercent}%
                    </div>
                )}

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
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
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
                            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {formatPrice(product.priceAfterDiscount ?? 0)}
                            </span>
                            {typeof product.originalPrice === 'number' && product.originalPrice > (product.priceAfterDiscount ?? 0) && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                        </div>
                        {typeof product.priceDiscount === 'number' && product.priceDiscount > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Tiết kiệm {formatPrice(product.priceDiscount)}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={adding === 'loading'}
                        className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                            ${adding === 'done'
                                ? 'bg-green-500 text-white'
                                : 'bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                            }`}
                    >
                        {adding === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                        {adding === 'done' && <Check className="w-4 h-4" />}
                        {adding === 'idle' && <ShoppingCart className="w-4 h-4" />}
                        {adding === 'done' ? 'Đã thêm' : 'Thêm vào giỏ'}
                    </button>
                </div>
            </div>
        </Link>
    );
}
