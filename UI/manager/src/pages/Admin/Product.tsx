import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { adminApi } from "@/services/api/adminApi";
import { ProductDetail, ProductResponse, Product as ProductType } from "@/types";
import { ChevronLeft, ChevronRight, Pencil, Plus, Settings, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Product = () => {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.auth);

    const [detailFormData, setDetailFormData] = useState<ProductDetail>({
        processor: "",
        ram: "",
        storage: "",
        graphicsCard: "",
        powerSupply: "",
        motherboard: "",
        case_: "",
        coolingSystem: "",
        operatingSystem: "",
        images: [],
        productId: "",
        id: "",
        imagesUpload: []
    });
    const [formData, setFormData] = useState<ProductType>({
        name: "",
        img: "",
        originalPrice: 0,
        discountPercent: 0,
        inStock: 0,
        supplier: {
            name: "",
            address: ""
        },
        priceAfterDiscount: 0,
        priceDiscount: 0
    });

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
        if (page > 0) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof ProductType | "supplierName" | "supplierAddress"
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

                setFormData({
                    ...formData,
                    [field]: value,
                    priceDiscount,
                    priceAfterDiscount
                });
            } else {
                setFormData({
                    ...formData,
                    [field]: value
                });
            }
        }
    };

    const handleDetailInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ProductDetail) => {
        if (field === "images") {
            setDetailFormData({
                ...detailFormData,
                images: e.target.value.split(",").map((url) => url.trim())
            });
        } else {
            setDetailFormData({
                ...detailFormData,
                [field]: e.target.value
            });
        }
    };
    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            if (editingProduct) {
                await adminApi.updateProduct(editingProduct.id, formData);
                toast({
                    title: "Success",
                    description: "Product updated successfully"
                });
            } else {
                const newProduct = { ...formData, img: formData.img.split(",")[1] };
                await adminApi.addProduct(newProduct);
                toast({
                    title: "Success",
                    description: "Product created successfully"
                });
            }
            setIsOpen(false);
            fetchProducts();
            resetForm();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";

            toast({
                title: "Thất bại",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDetailSubmit = async () => {
        try {
            setIsDetailLoading(true);
            if (!detailFormData) return;
            if (detailFormData.imagesUpload === undefined) detailFormData.imagesUpload = [];

            const imagesUpload = detailFormData.imagesUpload.map((url) => url.split(",")[1]);
            const updateData = {
                ...detailFormData,
                imagesUpload: imagesUpload
            };

            await adminApi.updateProductDetail(updateData);

            toast({
                title: "Success",
                description: "Product detail updated successfully"
            });

            setIsDetailOpen(false);
            fetchProducts();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update product detail",
                variant: "destructive"
            });
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleEdit = (product: ProductType) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            img: product.img,
            originalPrice: product.originalPrice,
            discountPercent: product.discountPercent,
            inStock: product.inStock,
            supplier: {
                name: product.supplier.name,
                address: product.supplier.address
            },
            priceAfterDiscount: product.priceAfterDiscount,
            priceDiscount: product.priceDiscount
        });
        setIsOpen(true);
    };

    const fetchProductDetail = async (id: string) => {
        try {
            const response = await adminApi.getProductDetail(id);

            const detail = response.data.result;

            setDetailFormData({
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
                productId: id,
                id: detail.id || "",
                imagesUpload: []
            });

            setIsDetailOpen(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch product detail",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bạn có chắc là muốn xóa sản phẩm này?")) {
            try {
                setIsDeleting(id);
                await adminApi.deleteProduct(id, token as string);
                toast({
                    title: "Success",
                    description: "Product deleted successfully"
                });
                fetchProducts();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete product",
                    variant: "destructive"
                });
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            img: "",
            originalPrice: 0,
            discountPercent: 0,
            inStock: 0,
            supplier: {
                name: "",
                address: ""
            },
            priceAfterDiscount: 0,
            priceDiscount: 0
        });
        setEditingProduct(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result as string;
                setDetailFormData({
                    ...detailFormData,
                    images: [...detailFormData.images],
                    imagesUpload: [...(detailFormData.imagesUpload || []), base64String]
                });
            };

            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index: number, type: string) => {
        if (type === "image") {
            setDetailFormData({
                ...detailFormData,
                images: detailFormData.images.filter((_, i) => i !== index)
            });
        } else if (type === "imagesUpload" && detailFormData.imagesUpload) {
            setDetailFormData({
                ...detailFormData,
                imagesUpload: detailFormData.imagesUpload.filter((_, i) => i !== index)
            });
        }
    };

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData({
                ...formData,
                img: base64String
            });
        };
        reader.readAsDataURL(file);
    };

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
                            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange(e, "name")}
                                    placeholder="Product name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Product Image</Label>
                                <div className="space-y-2">
                                    <div className="relative">
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
                                            onClick={() => document.getElementById("product-image-upload")?.click()}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Choose Image
                                        </Button>
                                    </div>
                                    {formData.img && (
                                        <div className="relative max-h-[200px] overflow-auto">
                                            <div className="relative w-[200px] mx-auto">
                                                <img
                                                    src={formData.img}
                                                    alt="Product preview"
                                                    className="w-full object-contain rounded-md"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => setFormData({ ...formData, img: "" })}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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
                                />
                            </div>
                            <div className="grid gap-4">
                                <Label>Supplier Information</Label>
                                <div className="grid gap-2">
                                    <Input
                                        placeholder="Supplier name"
                                        value={formData.supplier.name}
                                        onChange={(e) => handleInputChange(e, "supplierName")}
                                    />
                                    <Input
                                        placeholder="Supplier address"
                                        value={formData.supplier.address}
                                        onChange={(e) => handleInputChange(e, "supplierAddress")}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? "Loading..." : editingProduct ? "Update Product" : "Add Product"}
                            </Button>
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
                                        onClick={() => handleEdit(product)}
                                        disabled={isLoading}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setEditingProduct(product);
                                            fetchProductDetail(product.id as string);
                                        }}
                                        disabled={isDetailLoading}
                                    >
                                        <Settings className="h-4 w-4" />
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

            <Dialog
                open={isDetailOpen}
                onOpenChange={(open) => {
                    setIsDetailOpen(open);
                    if (!open) {
                        setDetailFormData({
                            id: "",
                            processor: "",
                            ram: "",
                            storage: "",
                            graphicsCard: "",
                            powerSupply: "",
                            motherboard: "",
                            case_: "",
                            coolingSystem: "",
                            operatingSystem: "",
                            images: [],
                            imagesUpload: [],
                            productId: ""
                        });
                    }
                }}
            >
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Product Images</Label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        id="image-upload"
                                        onChange={handleFileUpload}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById("image-upload")?.click()}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Images
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {detailFormData.images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image}
                                            alt={`Product ${index + 1}`}
                                            className="w-full aspect-square object-cover rounded-md"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveImage(index, "image")}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {detailFormData.imagesUpload &&
                                    detailFormData.imagesUpload.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`Product ${index + 1}`}
                                                className="w-full aspect-square object-cover rounded-md"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemoveImage(index, "imagesUpload")}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="processor">Processor</Label>
                            <Input
                                id="processor"
                                value={detailFormData.processor}
                                onChange={(e) => handleDetailInputChange(e, "processor")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ram">RAM</Label>
                            <Input
                                id="ram"
                                value={detailFormData.ram}
                                onChange={(e) => handleDetailInputChange(e, "ram")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="storage">Storage</Label>
                            <Input
                                id="storage"
                                value={detailFormData.storage}
                                onChange={(e) => handleDetailInputChange(e, "storage")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="graphicsCard">Graphics Card</Label>
                            <Input
                                id="graphicsCard"
                                value={detailFormData.graphicsCard}
                                onChange={(e) => handleDetailInputChange(e, "graphicsCard")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="powerSupply">Power Supply</Label>
                            <Input
                                id="powerSupply"
                                value={detailFormData.powerSupply}
                                onChange={(e) => handleDetailInputChange(e, "powerSupply")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="motherboard">Motherboard</Label>
                            <Input
                                id="motherboard"
                                value={detailFormData.motherboard}
                                onChange={(e) => handleDetailInputChange(e, "motherboard")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="case">Case</Label>
                            <Input
                                id="case"
                                value={detailFormData.case_}
                                onChange={(e) => handleDetailInputChange(e, "case_")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="coolingSystem">Cooling System</Label>
                            <Input
                                id="coolingSystem"
                                value={detailFormData.coolingSystem}
                                onChange={(e) => handleDetailInputChange(e, "coolingSystem")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="operatingSystem">Operating System</Label>
                            <Input
                                id="operatingSystem"
                                value={detailFormData.operatingSystem}
                                onChange={(e) => handleDetailInputChange(e, "operatingSystem")}
                            />
                        </div>
                        <Button onClick={handleDetailSubmit}>Update Details</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Product;
