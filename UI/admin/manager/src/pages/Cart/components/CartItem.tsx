import { useState } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItemWithProduct } from "@/types/Cart";

interface CartItemProps {
    item: CartItemWithProduct;
    selected: boolean;
    onToggle: (productId: string) => void;
    onIncrease: () => Promise<any> | void;
    onDecrease: () => Promise<any> | void;
    onRemove: () => Promise<any> | void;
}

export default function CartItem({ item, selected, onToggle, onIncrease, onDecrease, onRemove }: CartItemProps) {
    const [loadingInc, setLoadingInc] = useState(false);
    const [loadingDec, setLoadingDec] = useState(false);
    const [loadingRemove, setLoadingRemove] = useState(false);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

    const handleIncrease = async () => {
        try {
            setLoadingInc(true);
            await onIncrease?.();
        } finally {
            setLoadingInc(false);
        }
    };

    const handleDecrease = async () => {
        try {
            setLoadingDec(true);
            await onDecrease?.();
        } finally {
            setLoadingDec(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
        try {
            setLoadingRemove(true);
            await onRemove?.();
        } finally {
            setLoadingRemove(false);
        }
    };

    // fallback image (public placeholder URL)
    const imgSrc = item.product?.img || "https://via.placeholder.com/200?text=No+Image";

    return (
        <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow items-center">
            {/* checkbox */}
            <div className="flex-shrink-0">
                <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => onToggle(item.productId)}
                    className="w-5 h-5"
                    aria-label="Chọn"
                />
            </div>

            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{item.product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.product.supplier?.name}</p>

                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-blue-600">
                        {formatPrice(item.product.priceAfterDiscount)}
                    </span>
                    {typeof item.product.originalPrice === "number" &&
                        item.product.originalPrice > item.product.priceAfterDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                                {formatPrice(item.product.originalPrice)}
                            </span>
                        )}
                </div>
            </div>

            <div className="flex flex-col items-end justify-between">
                <button
                    onClick={handleRemove}
                    disabled={loadingRemove}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loadingRemove ? "..." : <Trash2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                    <button
                        onClick={handleDecrease}
                        disabled={item.quantity <= 1 || loadingDec || loadingInc}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loadingDec ? "..." : <Minus className="w-4 h-4" />}
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                        onClick={handleIncrease}
                        disabled={loadingInc || loadingDec}
                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingInc ? "..." : <Plus className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
