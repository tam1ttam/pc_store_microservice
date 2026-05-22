import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { adminApi } from "@/services/api/adminApi";
import { ProductAttribute, ProductResponse, Product as ProductType } from "@/types";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Trash, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type AttributeRow = {
    name: string;
    value: string;
    unit: string;
    description: string;
};

const emptyAttribute = (): AttributeRow => ({ name: "", value: "", unit: "", description: "" });

const Product = () => {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.auth);

    const initialFormData = {
        name: "",
        img: "",
        originalPrice: 0,
        discountPercent: 0,
        inStock: 0,
        supplier: { name: "", address: "" },
        priceAfterDiscount: 0,
        priceDiscount: 0,
        images: [] as string[],
        imagesUpload: [] as string[]
    };

    const [formData, setFormData] = useState<any>(initialFormData);
    const [attributes, setAttributes] = useState<AttributeRow[]>([]);

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const fetchProducts = async () => {
        try {
            const response = await adminApi.listProducts(page);
            setProducts(response.data.result.content);
            setTotalPages(response.data.result.totalPages);
        } catch {
            toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" });
        }
    };

    const handlePrevPage = () => { if (page > 0) setPage(page - 1); };
    const handleNextPage = () => { if (page < totalPages - 1) setPage(page + 1); };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof typeof formData | "supplierName" | "supplierAddress"
    ) => {
        if (field === "supplierName" || field === "supplierAddress") {
            setFormData({
                ...formData,
                supplier: {
                    ...formData.supplier,
                    [field === "supplierName" ? "name" : "address"]: e.target.value
                }
            });
        } else {
            const value = ["originalPrice", "discountPercent", "inStock", "priceAfterDiscount", "priceDiscount"].includes(field)
                ? Number(e.target.value)
                : e.target.value;

            if (field === "originalPrice" || field === "discountPercent") {
                const originalPrice = field === "originalPrice" ? Number(e.target.value) : formData.originalPrice;
                const discountPercent = field === "discountPercent" ? Number(e.target.value) : formData.discountPercent;
                const priceDiscount = (originalPrice * discountPercent) / 100;
                const priceAfterDiscount = originalPrice - priceDiscount;
                setFormData({ ...formData, [field]: value, priceDiscount, priceAfterDiscount });
            } else {
                setFormData({ ...formData, [field]: value });
            }
        }
    };

    // ─── Attribute helpers ────────────────────────────────────────────────────────

    const addAttribute = () => setAttributes((prev) => [...prev, emptyAttribute()]);

    const removeAttribute = (index: number) =>
        setAttributes((prev) => prev.filter((_, i) => i !== index));

    const updateAttribute = (index: number, field: keyof AttributeRow, value: string) =>
        setAttributes((prev) =>
            prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr))
        );

    // ─── Image helpers ────────────────────────────────────────────────────────────

    const validateFileSize = (file: File): boolean => {
        if (file.size > MAX_FILE_SIZE) {
            toast({ title: "File quá lớn", description: `${file.name} vượt quá 5MB`, variant: "destructive" });
            return false;
        }
        return true;
    };

    const readFileAsBase64 = (file: File): Promise<string> =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !validateFileSize(file)) return;
        const base64 = await readFileAsBase64(file);
        setFormData({ ...formData, img: base64 });
    };

    const handleProductMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const validFiles = Array.from(files).filter(validateFileSize);
        const base64List = await Promise.all(validFiles.map(readFileAsBase64));
        setFormData((prev: any) => ({ ...prev, imagesUpload: [...(prev.imagesUpload ?? []), ...base64List] }));
        e.target.value = "";
    };

    const handleRemoveImage = (index: number, type: "images" | "imagesUpload") => {
        setFormData((prev: any) => ({ ...prev, [type]: prev[type].filter((_: any, i: number) => i !== index) }));
    };

    const isVideoBase64 = (b64: string) => b64.startsWith("data:video");

    // ─── Form submit ──────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            const { images, imagesUpload, ...productData } = formData;

            const detailRequest = {
                attributes: attributes.filter((a) => a.name.trim() !== ""),
                images: formData.images,
                imagesUpload: formData.imagesUpload ?? []
            };

            if (editingProduct) {
                await adminApi.updateProduct(editingProduct.id, {
                    ...productData,
                    productDetailCreationRequest: detailRequest
                });
                toast({ title: "Success", description: "Product updated successfully" });
            } else {
                await adminApi.addProduct({
                    ...productData,
                    productDetailCreationRequest: detailRequest
                });
                toast({ title: "Success", description: "Product created successfully" });
            }
            setIsOpen(false);
            fetchProducts();
            resetForm();
        } catch (error: any) {
            toast({ title: "Thất bại", description: error.response?.data?.message || "Có lỗi xảy ra", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (product: ProductType, readOnly = false) => {
        setEditingProduct(product);
        setIsReadOnly(readOnly);
        setIsLoading(true);
        try {
            const detailResponse = await adminApi.getProductDetail(product.id as string);
            const detail = detailResponse.data.result;
            setFormData({
                name: product.name,
                img: product.img,
                originalPrice: product.originalPrice,
                discountPercent: product.discountPercent,
                inStock: product.inStock,
                supplier: { name: product.supplier.name, address: product.supplier.address },
                priceAfterDiscount: product.priceAfterDiscount,
                priceDiscount: product.priceDiscount,
                images: detail.images || [],
                imagesUpload: []
            });
            setAttributes(
                (detail.attributes ?? []).map((a: any) => ({
                    name: a.name ?? "",
                    value: a.value ?? "",
                    unit: a.unit ?? "",
                    description: a.description ?? ""
                }))
            );
        } catch {
            setFormData({
                ...initialFormData,
                name: product.name,
                img: product.img,
                originalPrice: product.originalPrice,
                discountPercent: product.discountPercent,
                inStock: product.inStock,
                supplier: { name: product.supplier.name, address: product.supplier.address },
                priceAfterDiscount: product.priceAfterDiscount,
                priceDiscount: product.priceDiscount
            });
            setAttributes([]);
        } finally {
            setIsLoading(false);
            setIsOpen(true);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bạn có chắc là muốn xóa sản phẩm này?")) {
            try {
                setIsDeleting(id);
                await adminApi.deleteProduct(id, token as string);
                toast({ title: "Success", description: "Product deleted successfully" });
                fetchProducts();
            } catch {
                toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setAttributes([]);
        setEditingProduct(null);
        setIsReadOnly(false);
    };

    return (
        <div className="container mx-auto py-6 pt-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>

                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isReadOnly ? "Product Details" : editingProduct ? "Edit Product" : "Add New Product"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Name */}
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={(e) => handleInputChange(e, "name")} placeholder="Product name" readOnly={isReadOnly} />
                            </div>

                            {/* Thumbnail */}
                            <div className="grid gap-2">
                                <Label>Thumbnail Image</Label>
                                <div className="space-y-2">
                                    {!isReadOnly && (
                                        <>
                                            <input type="file" accept="image/*" className="hidden" id="product-image-upload" onChange={handleProductImageUpload} />
                                            <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById("product-image-upload")?.click()}>
                                                <Plus className="h-4 w-4 mr-2" /> Choose Thumbnail
                                            </Button>
                                        </>
                                    )}
                                    {formData.img && (
                                        <div className="relative w-[200px] mx-auto">
                                            <img src={formData.img} alt="Thumbnail" className="w-full object-contain rounded-md" />
                                            {!isReadOnly && (
                                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => setFormData({ ...formData, img: "" })}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional images */}
                            <div className="grid gap-2">
                                <Label>Additional Images / Videos (max 5MB)</Label>
                                <div className="space-y-2">
                                    {!isReadOnly && (
                                        <>
                                            <input type="file" accept="image/*,video/*" multiple className="hidden" id="product-media-upload" onChange={handleProductMediaUpload} />
                                            <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById("product-media-upload")?.click()}>
                                                <Plus className="h-4 w-4 mr-2" /> Add Images / Videos
                                            </Button>
                                        </>
                                    )}
                                    <div className="grid grid-cols-3 gap-2">
                                        {formData.images.map((src: string, i: number) => (
                                            <div key={`existing-${i}`} className="relative group">
                                                <img src={src} alt={`media ${i}`} className="w-full aspect-square object-cover rounded-md" />
                                                {!isReadOnly && (
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6" onClick={() => handleRemoveImage(i, "images")}>
                                                        <Trash className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {formData.imagesUpload.map((src: string, i: number) => (
                                            <div key={`new-${i}`} className="relative group">
                                                {isVideoBase64(src) ? (
                                                    <video src={src} className="w-full aspect-square object-cover rounded-md" muted />
                                                ) : (
                                                    <img src={src} alt={`media ${i}`} className="w-full aspect-square object-cover rounded-md" />
                                                )}
                                                {!isReadOnly && (
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6" onClick={() => handleRemoveImage(i, "imagesUpload")}>
                                                        <Trash className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Price fields */}
                            <div className="grid gap-2">
                                <Label>Original Price</Label>
                                <Input type="number" value={formData.originalPrice} onChange={(e) => handleInputChange(e, "originalPrice")} readOnly={isReadOnly} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Discount Percent (%)</Label>
                                <Input type="number" min="0" max="100" value={formData.discountPercent} onChange={(e) => handleInputChange(e, "discountPercent")} readOnly={isReadOnly} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Discount Amount</Label>
                                    <Input type="number" value={formData.priceDiscount} disabled className="bg-gray-100" />
                                </div>
                                <div>
                                    <Label>Final Price</Label>
                                    <Input type="number" value={formData.priceAfterDiscount} disabled className="bg-gray-100" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Stock Quantity</Label>
                                <Input type="number" min="0" value={formData.inStock} onChange={(e) => handleInputChange(e, "inStock")} readOnly={isReadOnly} />
                            </div>

                            {/* Supplier */}
                            <div className="grid gap-2">
                                <Label>Supplier Information</Label>
                                <Input placeholder="Supplier name" value={formData.supplier.name} onChange={(e) => handleInputChange(e, "supplierName")} readOnly={isReadOnly} />
                                <Input placeholder="Supplier address" value={formData.supplier.address} onChange={(e) => handleInputChange(e, "supplierAddress")} readOnly={isReadOnly} />
                            </div>

                            {/* Dynamic Attributes */}
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-semibold">Thông số kỹ thuật</h3>
                                    {!isReadOnly && (
                                        <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                                            <Plus className="h-3 w-3 mr-1" /> Thêm thuộc tính
                                        </Button>
                                    )}
                                </div>

                                {attributes.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        {isReadOnly ? "Chưa có thông số" : "Bấm \"Thêm thuộc tính\" để thêm thông số sản phẩm"}
                                    </p>
                                )}

                                <div className="space-y-2">
                                    {attributes.map((attr, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="col-span-3">
                                                <Label className="text-xs text-gray-500 mb-1 block">Tên</Label>
                                                <Input
                                                    value={attr.name}
                                                    onChange={(e) => updateAttribute(index, "name", e.target.value)}
                                                    placeholder="VD: RAM"
                                                    className="h-8 text-sm"
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <Label className="text-xs text-gray-500 mb-1 block">Giá trị</Label>
                                                <Input
                                                    value={attr.value}
                                                    onChange={(e) => updateAttribute(index, "value", e.target.value)}
                                                    placeholder="VD: 16"
                                                    className="h-8 text-sm"
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-xs text-gray-500 mb-1 block">Đơn vị</Label>
                                                <Input
                                                    value={attr.unit}
                                                    onChange={(e) => updateAttribute(index, "unit", e.target.value)}
                                                    placeholder="VD: GB"
                                                    className="h-8 text-sm"
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-xs text-gray-500 mb-1 block">Mô tả</Label>
                                                <Input
                                                    value={attr.description}
                                                    onChange={(e) => updateAttribute(index, "description", e.target.value)}
                                                    placeholder="Tùy chọn"
                                                    className="h-8 text-sm"
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                            {!isReadOnly && (
                                                <div className="col-span-1 flex items-end pb-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                        onClick={() => removeAttribute(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {!isReadOnly && (
                                <Button onClick={handleSubmit} disabled={isLoading}>
                                    {isLoading ? "Loading..." : editingProduct ? "Update Product" : "Add Product"}
                                </Button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                <img src={product.img} alt={product.name} className="w-16 h-16 object-cover" />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.originalPrice)}
                            </TableCell>
                            <TableCell>{product.discountPercent}%</TableCell>
                            <TableCell>{product.inStock}</TableCell>
                            <TableCell>{product.supplier.name}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(product, true)} disabled={isLoading}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(product)} disabled={isLoading}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id as string)} disabled={isDeleting === product.id}>
                                        {isDeleting === product.id ? "..." : <Trash className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" onClick={handlePrevPage} disabled={page === 0}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" onClick={handleNextPage} disabled={page === totalPages - 1}>
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default Product;
