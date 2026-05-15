import { PayPal, ShipCOD } from "@/assets/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { deleteCartItem, getCartCount } from "@/redux/thunks/cart";
import { viewOrder } from "@/redux/thunks/order";
import { cartApi } from "@/services/api/cartApi";
import { post, get } from "@/services/api.service";
import { ENDPOINTS } from "@/constants";
import { Loader2, MapPin, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Cart() {
    const [items, setItems] = useState<any[]>([]);
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { info: user } = useSelector((state: RootState) => state.user);
    const [isLoading, setIsloading] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [address, setAddress] = useState(localStorage.getItem("addressShipping") || "");
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [isOrdering, setIsOrdering] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("ship");

    // 2. HÀM MỚI: Dùng đúng đường link "?id=" của Backend
    const loadCartData = async () => {
        if (!user?.id) return;
        try {
            const res = await cartApi.getCartItems(user.id);
            const orders = res.data?.result || res.data;

            if (orders && Array.isArray(orders) && orders.length > 0) {
                const cartOrders = orders.filter((o: any) => o.orderStatus === "CART" || !o.orderStatus);

                let allItems: any[] = [];
                cartOrders.forEach((order: any) => {
                    if (order.items && Array.isArray(order.items)) {
                        allItems = [...allItems, ...order.items];
                    }
                });

                const validItems = allItems.filter(item => item.productId && !item.productId.includes("-"));

                if (validItems.length > 0) {
                    const itemsWithRealData = await Promise.all(
                        validItems.map(async (apiItem: any) => {
                            try {
                                // 👉 BÍ MẬT NẰM Ở ĐÂY: Dùng đúng cú pháp /id?id= của Backend
                                const productRes = await get<any>(`${ENDPOINTS.PRODUCTS}/id?id=${apiItem.productId}`);
                                
                                const responseData = productRes.data || productRes;
                                const realProduct = responseData?.result || responseData?.data || responseData;

                                const pName = realProduct?.name || realProduct?.productName || "Sản phẩm";
                                const pPrice = realProduct?.priceAfterDiscount || realProduct?.discountPrice || realProduct?.price || 0;
                                const pOriginalPrice = realProduct?.originalPrice || realProduct?.price || pPrice;
                                
                                let pImg = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                                if (typeof realProduct?.img === 'string') pImg = realProduct.img;
                                else if (typeof realProduct?.image === 'string') pImg = realProduct.image;
                                else if (Array.isArray(realProduct?.images) && realProduct.images.length > 0) {
                                    pImg = realProduct.images[0]?.url || realProduct.images[0] || pImg;
                                }

                                return {
                                    quantity: apiItem.quantity || 1,
                                    product: {
                                        id: apiItem.productId,
                                        name: pName,
                                        img: pImg,
                                        priceAfterDiscount: pPrice,
                                        originalPrice: pOriginalPrice,
                                        supplier: { name: realProduct?.supplier?.name || "Hệ thống PC Store" }
                                    }
                                };
                            } catch (err) {
                                return {
                                    quantity: apiItem.quantity || 1,
                                    product: {
                                        id: apiItem.productId,
                                        name: "Sản phẩm (Lỗi kết nối API)",
                                        img: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
                                        priceAfterDiscount: 0,
                                        originalPrice: 0,
                                        supplier: { name: "PC Store" }
                                    }
                                };
                            }
                        })
                    );

                    // Thuật toán gộp hàng trùng lặp
                    const uniqueItemsMap = new Map();
                    itemsWithRealData.forEach(item => {
                        if (uniqueItemsMap.has(item.product.id)) {
                            const existing = uniqueItemsMap.get(item.product.id);
                            existing.quantity += item.quantity;
                        } else {
                            uniqueItemsMap.set(item.product.id, item);
                        }
                    });

                    setItems(Array.from(uniqueItemsMap.values()));
                } else {
                    setItems([]); 
                }
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
            setItems([]);
        }
    };
    useEffect(() => {
        loadCartData();
    }, [user?.id]);

    const totalPrice = useMemo(() => {
        return (
            items?.reduce((total, item) => {
                if (!item?.product?.priceAfterDiscount) return total;
                const quantity = quantities[item.product.id as string] || item.quantity;
                return total + item.product.priceAfterDiscount * quantity;
            }, 0) || 0
        );
    }, [items, quantities]);

    useEffect(() => {
        if (items.length > 0) {
            const initialQuantities: { [key: string]: number } = {};
            items?.forEach((item) => {
                initialQuantities[item.product.id as string] = item.quantity;
            });
            setQuantities(initialQuantities as any);
        }
    }, [items]); 

    const handleDeleteCartItem = async (productId: string) => {
        try {
            const result = await dispatch(
                deleteCartItem({
                    userId: user?.id as string,
                    productId
                }) as any
            );

            if (result.payload?.code === 1000) {
                toast({ title: "Xóa sản phẩm thành công" });
                dispatch(getCartCount({ userId: user?.id as string }) as any);
                loadCartData(); 
            } else {
                toast({ title: "Xóa sản phẩm thất bại", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Đã có lỗi xảy ra", variant: "destructive" });
        }
    };

    const handleDecreaseQuantity = async (productId: string) => {
        const currentQuantity = quantities[productId];
        if (currentQuantity <= 1) return;

        setIsloading(true);
        setQuantities((prev) => ({ ...prev, [productId]: prev[productId] - 1 }));

        try {
            const result = await cartApi.decreaseQuantity(user?.id as string, productId);
            dispatch(getCartCount({ userId: user?.id as string }) as any);
            loadCartData();

            if (result.data.code !== 1000) {
                setQuantities((prev) => ({ ...prev, [productId]: prev[productId] + 1 }));
                toast({ title: "Giảm số lượng thất bại", variant: "destructive" });
            }
        } catch (error) {
            setQuantities((prev) => ({ ...prev, [productId]: prev[productId] + 1 }));
            toast({ title: "Đã có lỗi xảy ra", variant: "destructive" });
        } finally {
            setIsloading(false);
        }
    };

    const handleIncreaseQuantity = async (productId: string) => {
        setIsloading(true);
        setQuantities((prev) => ({ ...prev, [productId]: prev[productId] + 1 }));

        try {
            const result = await cartApi.increaseQuantity(user?.id as string, productId);
            dispatch(getCartCount({ userId: user?.id as string }) as any);
            loadCartData();

            if (result.data.code !== 1000) {
                setQuantities((prev) => ({ ...prev, [productId]: prev[productId] - 1 }));
                toast({ title: "Tăng số lượng thất bại", variant: "destructive" });
            }
        } catch (error: any) {
            setQuantities((prev) => ({ ...prev, [productId]: prev[productId] - 1 }));
            toast({ title: "Đã có lỗi xảy ra", variant: "destructive" });
        } finally {
            setIsloading(false);
        }
    };

    const handleOrder = async () => {
        if (!address) {
            toast({ title: "Vui lòng nhập địa chỉ giao hàng", variant: "destructive" });
            setShowAddressModal(true);
            return;
        }

        const backendItems = items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            productPrice: item.product.priceAfterDiscount,
            quantity: quantities[item.product.id as string] || item.quantity
        }));

        if (paymentMethod === "ship") {
            setIsOrdering(true);
            try {
                const result = await post<any>(ENDPOINTS.ORDER, {
                    customerId: user?.id,
                    shipAddress: address,
                    items: backendItems,
                    totalPrice,
                    orderStatus: "DELIVERING",
                    isPaid: "false"
                });

                if (result.data.code === 1000) {
                    toast({ title: "Đặt hàng thành công" });
                    dispatch(getCartCount({ userId: user?.id as string }) as any);
                    dispatch(viewOrder({ userId: user?.id as string }) as any);
                } else {
                    throw new Error("Failed to order");
                }
            } catch (error: any) {
                toast({ title: "Đặt hàng thất bại", variant: "destructive" });
            } finally {
                setIsOrdering(false);
            }
        } else if (paymentMethod === "paypal") {
            setIsOrdering(true);
            try {
                const response = await post<any>(`${ENDPOINTS.PAYPAL}`, {
                    amount: totalPrice,
                    userId: user?.id,
                    shipAddress: address,
                    items: backendItems
                });

                if (response.data.code === 1000) {
                    localStorage.setItem("paymentId", response.data.result.paymentId as string);
                    window.location.href = response.data.result.url;
                } else {
                    toast({ title: "Đặt hàng thất bại vui lòng thử lại", variant: "destructive" });
                }
            } catch (error) {
                toast({ title: "Lỗi kết nối", variant: "destructive" });
            } finally {
                setIsOrdering(false);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 pb-10 relative pt-24">
            <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                <Link to="/" className="hover:text-orange-500 transition-colors">
                    Trang chủ
                </Link>
                <span>/</span>
                <span className="text-orange-500">Giỏ hàng</span>
            </div>
            <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

            {!items?.length ? (
                <div className="text-center py-16">
                    <ShoppingCart className="w-20 h-20 mx-auto text-orange-500 mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">Không có sản phẩm trong giỏ hàng</p>
                    <Button asChild variant="outline" className="hover:text-orange-500 hover:border-orange-500">
                        <Link to="/products">Tiếp tục mua sắm</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {items?.map((item) => (
                            <Card key={item.product.id}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <img
                                        src={item.product.img}
                                        alt={item.product.name}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base line-clamp-2">{item.product.name}</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Nhà cung cấp: {item.product.supplier.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-medium text-orange-500">
                                                {item.product.priceAfterDiscount.toLocaleString("vi-VN")}đ
                                            </span>
                                            <span className="text-muted-foreground line-through text-sm">
                                                {item.product.originalPrice.toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 ">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer"
                                                onClick={() => handleDecreaseQuantity(item.product.id as string)}
                                                disabled={isLoading || quantities[item.product.id as string] <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-8 text-center">
                                                {quantities[item.product.id as string]}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer"
                                                onClick={() => handleIncreaseQuantity(item.product.id as string)}
                                                disabled={isLoading}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 ml-auto text-muted-foreground hover:text-red-500"
                                                onClick={() => handleDeleteCartItem(item.product.id as string)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-orange-500" size={20} />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium block mb-1">Địa chỉ giao hàng</span>
                                        {address ? (
                                            <p className="text-muted-foreground text-sm truncate">{address}</p>
                                        ) : (
                                            <Badge variant="outline" className="text-orange-500 border-orange-500">
                                                Chưa có địa chỉ
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                        onClick={() => setShowAddressModal(true)}
                                    >
                                        {address ? "Sửa" : "Thêm"}
                                    </Button>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-medium mb-3">Phương thức thanh toán</h3>
                                    <RadioGroup
                                        defaultValue="ship"
                                        className="grid grid-cols-2 gap-3"
                                        onValueChange={setPaymentMethod}
                                    >
                                        <div className="col-span-1">
                                            <Label
                                                htmlFor="ship"
                                                className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-500 [&:has([data-state=checked])]:border-orange-500 [&:has([data-state=checked])]:bg-orange-50"
                                            >
                                                <img src={ShipCOD} alt="COD" className="w-8 h-8" />
                                                <RadioGroupItem value="ship" id="ship" className="sr-only" />
                                                <span className="text-sm text-center">Thanh toán khi nhận hàng</span>
                                            </Label>
                                        </div>
                                        <div className="col-span-1">
                                            <Label
                                                htmlFor="paypal"
                                                className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-500 [&:has([data-state=checked])]:border-orange-500 [&:has([data-state=checked])]:bg-orange-50"
                                            >
                                                <img src={PayPal} alt="paypal" className="w-8 h-8" />
                                                <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                                                <span className="text-sm text-center">Thanh toán bằng PayPal</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Tạm tính:</span>
                                        <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Phí vận chuyển:</span>
                                        <span>0đ</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center font-medium text-lg">
                                        <span>Tổng tiền:</span>
                                        <span className="text-orange-500">{totalPrice.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-orange-500 hover:bg-orange-600"
                                    size="lg"
                                    onClick={handleOrder}
                                    disabled={isOrdering || !items?.length}
                                >
                                    {isOrdering ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            {paymentMethod === "ship" ? "Đặt hàng" : "Thanh toán"}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Địa chỉ giao hàng</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        className="min-h-[100px] resize-none"
                        placeholder="Nhập địa chỉ giao hàng của bạn"
                        value={address}
                        onChange={(e) => {
                            setAddress(e.target.value);
                            localStorage.setItem("addressShipping", e.target.value);
                        }}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddressModal(false)}>
                            Hủy
                        </Button>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => {
                                if (address.trim()) {
                                    setShowAddressModal(false);
                                } else {
                                    toast({
                                        title: "Vui lòng nhập địa chỉ giao hàng",
                                        variant: "destructive"
                                    });
                                }
                            }}
                        >
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Cart;