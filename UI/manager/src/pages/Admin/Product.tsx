import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { adminApi } from "@/services/api/adminApi";
import { ProductDetail, ProductResponse, Product as ProductType } from "@/types";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
        // Detail fields
        processor: "",
        ram: "",
        storage: "",
        graphicsCard: "",
        powerSupply: "",
        motherboard: "",
        case_: "",
        coolingSystem: "",
        operatingSystem: "",
        images: [] as string[],
        imagesUpload: [] as string[]
    };

    const [formData, setFormData] = useState<any>(initialFormData);

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const fetchProducts = async () => {
        try {
            const response = await adminApi.listProducts(page);
            setProducts(response.data.result.content);
            setTotalPages(response.data.result.totalPages);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch products",
                variant: "destructive"
            });
        }
    };

    const handlePrevPage = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

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
            const value = [
                "originalPrice",
                "discountPercent",
                "inStock",
                "priceAfterDiscount",
                "priceDiscount"
            ].includes(field)
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

    const validateFileSize = (file: File): boolean => {
        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: "File quá lớn",
                description: `${file.name} vượt quá 5MB`,
                variant: "destructive"
            });
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

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            const { images, imagesUpload, ...productData } = formData;

            const detailRequest = {
                processor: formData.processor,
                ram: formData.ram,
                storage: formData.storage,
                graphicsCard: formData.graphicsCard,
                powerSupply: formData.powerSupply,
                motherboard: formData.motherboard,
                case_: formData.case_,
                coolingSystem: formData.coolingSystem,
                operatingSystem: formData.operatingSystem,
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
            toast({
                title: "Thất bại",
                description: error.response?.data?.message || "Có lỗi xảy ra",
                variant: "destructive"
            });
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
                processor: detail.processor || "",
                ram: detail.ram || "",
                storage: detail.storage || "",
                graphicsCard: detail.graphicsCard || "",
                powerSupply: detail.powerSupply || "",
                motherboard: detail.motherboard || "",
                case_: detail.case_ || "",
                coolingSystem: detail.coolingSystem || "",
                operatingSystem: detail.operatingSystem || "",
                images: detail.images || [],
                imagesUpload: []
            });
        } catch (error) {
            // If no detail, just load the main product data
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
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingProduct(null);
        setIsReadOnly(false);
    };

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
        setFormData((prev: any) => ({
            ...prev,
            imagesUpload: [...(prev.imagesUpload ?? []), ...base64List]
        }));
        e.target.value = "";
    };

    const handleRemoveImage = (index: number, type: "images" | "imagesUpload") => {
        setFormData((prev: any) => ({
            ...prev,
            [type]: prev[type].filter((_: any, i: number) => i !== index)
        }));
    };

    const isVideoBase64 = (b64: string) => b64.startsWith("data:video");

    return (
        <div className="container mx-auto py-6 pt-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) resetForm();
                    }}
                >
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isReadOnly
                                    ? "Product Details"
                                    : editingProduct
                                        ? "Edit Product"
                                        : "Add New Product"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange(e, "name")}
                                    placeholder="Product name"
                                    readOnly={isReadOnly}
                                />
                            </div>

                            {/* Thumbnail */}
                            <div className="grid gap-2">
                                <Label>Thumbnail Image</Label>
                                <div className="space-y-2">
                                    {!isReadOnly && (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="product-image-upload"
                                                onChange={handleProductImageUpload}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                    document.getElementById("product-image-upload")?.click()
                                                }
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Choose Thumbnail
                                            </Button>
                                        </>
                                    )}
                                    {formData.img && (
                                        <div className="relative w-[200px] mx-auto">
                                            <img
                                                src={formData.img}
                                                alt="Thumbnail"
                                                className="w-full object-contain rounded-md"
                                            />
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => setFormData({ ...formData, img: "" })}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional images / short videos */}
                            <div className="grid gap-2">
                                <Label>Additional Images / Videos (max 5MB each)</Label>
                                <div className="space-y-2">
                                    {!isReadOnly && (
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            multiple
                                            className="hidden"
                                            id="product-media-upload"
                                            onChange={handleProductMediaUpload}
                                        />
                                    )}
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => document.getElementById("product-media-upload")?.click()}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Images / Videos
                                        </Button>
                                    )}
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Existing Images */}
                                        {formData.images.map((src: string, i: number) => (
                                            <div key={`existing-${i}`} className="relative group">
                                                <img
                                                    src={src}
                                                    alt={`media ${i}`}
                                                    className="w-full aspect-square object-cover rounded-md"
                                                />
                                                {!isReadOnly && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                                        onClick={() => handleRemoveImage(i, "images")}
                                                    >
                                                        <Trash className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {/* New Uploads */}
                                        {formData.imagesUpload.map((src: string, i: number) => (
                                            <div key={`new-${i}`} className="relative group">
                                                {isVideoBase64(src) ? (
                                                    <video
                                                        src={src}
                                                        className="w-full aspect-square object-cover rounded-md"
                                                        muted
                                                    />
                                                ) : (
                                                    <img
                                                        src={src}
                                                        alt={`media ${i}`}
                                                        className="w-full aspect-square object-cover rounded-md"
                                                    />
                                                )}
                                                {!isReadOnly && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                                        onClick={() => handleRemoveImage(i, "imagesUpload")}
                                                    >
                                                        <Trash className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="originalPrice">Original Price</Label>
                                <Input
                                    id="originalPrice"
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={(e) => handleInputChange(e, "originalPrice")}
                                    placeholder="Enter original price"
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="discountPercent">Discount Percent (%)</Label>
                                <Input
                                    id="discountPercent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discountPercent}
                                    onChange={(e) => handleInputChange(e, "discountPercent")}
                                    placeholder="Enter discount percentage"
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Calculated Prices</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="priceDiscount">Discount Amount</Label>
                                        <Input
                                            id="priceDiscount"
                                            type="number"
                                            value={formData.priceDiscount}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="priceAfterDiscount">Final Price</Label>
                                        <Input
                                            id="priceAfterDiscount"
                                            type="number"
                                            value={formData.priceAfterDiscount}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="inStock">Stock Quantity</Label>
                                <Input
                                    id="inStock"
                                    type="number"
                                    min="0"
                                    value={formData.inStock}
                                    onChange={(e) => handleInputChange(e, "inStock")}
                                    placeholder="Enter stock quantity"
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div className="grid gap-4">
                                <Label>Supplier Information</Label>
                                <div className="grid gap-2">
                                    <Input
                                        placeholder="Supplier name"
                                        value={formData.supplier.name}
                                        onChange={(e) => handleInputChange(e, "supplierName")}
                                        readOnly={isReadOnly}
                                    />
                                    <Input
                                        placeholder="Supplier address"
                                        value={formData.supplier.address}
                                        onChange={(e) => handleInputChange(e, "supplierAddress")}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                            </div>

                            {/* Spec fields */}
                            <h3 className="text-lg font-semibold mt-4 pt-4 border-t">Product Specifications</h3>
                            {(
                                [
                                    { id: "processor", label: "Processor" },
                                    { id: "ram", label: "RAM" },
                                    { id: "storage", label: "Storage" },
                                    { id: "graphicsCard", label: "Graphics Card" },
                                    { id: "powerSupply", label: "Power Supply" },
                                    { id: "motherboard", label: "Motherboard" },
                                    { id: "case_", label: "Case" },
                                    { id: "coolingSystem", label: "Cooling System" },
                                    { id: "operatingSystem", label: "Operating System" }
                                ] as { id: keyof typeof formData; label: string }[]
                            ).map(({ id, label }) => (
                                <div key={id} className="grid gap-2">
                                    <Label htmlFor={id}>{label}</Label>
                                    <Input
                                        id={id}
                                        value={(formData[id] as string) || ""}
                                        onChange={(e) => handleInputChange(e, id)}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                            ))}

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
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                }).format(product.originalPrice)}
                            </TableCell>
                            <TableCell>{product.discountPercent} %</TableCell>
                            <TableCell>{product.inStock}</TableCell>
                            <TableCell>{product.supplier.name}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEdit(product, true)}
                                        disabled={isLoading}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEdit(product)}
                                        disabled={isLoading}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(product.id as string)}
                                        disabled={isDeleting === product.id}
                                    >
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
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <Button variant="outline" onClick={handleNextPage} disabled={page === totalPages - 1}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default Product;
