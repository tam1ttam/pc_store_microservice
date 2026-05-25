import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { adminApi } from "@/services/api/adminApi";
import { Product as ProductType } from "@/types";
import { ChevronDown, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, Layers, Pencil, Plus, Tag, Trash, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ImportProductDialog from "./ImportProductDialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type AttributeRow = { name: string; value: string; unit: string; description: string };
const emptyAttribute = (): AttributeRow => ({ name: "", value: "", unit: "", description: "" });

type Category = { id: string; keyword: string; name: string };

const Product = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
    const [products, setProducts] = useState<ProductType[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const { token } = useSelector((state: RootState) => state.auth);

    // Category filter (multi-select)
    const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Categories management tab
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(null);
    const [categorySearch, setCategorySearch] = useState("");

    const initialFormData = {
        name: "", img: "", price: 0, unit: "", inStock: 0, category: "",
        supplier: { name: "", address: "" },
        images: [] as string[],
        imagesUpload: [] as string[]
    };
    const [formData, setFormData] = useState<any>(initialFormData);
    const [attributes, setAttributes] = useState<AttributeRow[]>([]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
                setFilterDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        loadProducts(page, selectedCategoryFilters);
    }, [page, selectedCategoryFilters]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const loadProducts = async (p: number, catFilters: string[]) => {
        try {
            let response;
            if (catFilters.length > 0) {
                response = await adminApi.listProductsByCategories(catFilters, p);
            } else {
                response = await adminApi.listProducts(p);
            }
            setProducts(response.data.result.content);
            setTotalPages(response.data.result.totalPages);
        } catch {
            toast({ title: t("common.error"), description: t("product.deleteFailed"), variant: "destructive" });
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await adminApi.listCategories();
            const list: Category[] = response.data.result ?? [];
            setCategories(list);
            if (list.length > 0) {
                try {
                    const countsRes = await adminApi.getCategoryCounts(list.map(c => c.keyword));
                    setCategoryCounts(countsRes.data.result ?? {});
                } catch { /* counts non-fatal */ }
            }
        } catch { /* non-fatal */ }
    };

    const toggleCategoryFilter = (name: string) => {
        const next = selectedCategoryFilters.includes(name)
            ? selectedCategoryFilters.filter(n => n !== name)
            : [...selectedCategoryFilters, name];
        setSelectedCategoryFilters(next);
        if (page !== 0) setPage(0);
    };

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return;
        setIsSavingCategory(true);
        try {
            await adminApi.createCategory(name);
            setNewCategoryName("");
            await fetchCategories();
            toast({ title: t("product.categoryAddSuccess"), description: t("product.categoryAddSuccessDesc", { name }) });
        } catch (err: any) {
            toast({ title: t("product.categoryError"), description: err.response?.data?.message || t("product.categoryAddError"), variant: "destructive" });
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!window.confirm(t("product.deleteCategoryConfirm", { name }))) return;
        setIsDeletingCategory(id);
        try {
            await adminApi.deleteCategory(id);
            await fetchCategories();
            toast({ title: t("product.categoryDeleted"), description: t("product.categoryDeletedDesc", { name }) });
        } catch (err: any) {
            toast({ title: t("product.categoryError"), description: err.response?.data?.message || t("product.categoryDeleteError"), variant: "destructive" });
        } finally {
            setIsDeletingCategory(null);
        }
    };

    const handlePrevPage = () => { if (page > 0) setPage(page - 1); };
    const handleNextPage = () => { if (page < totalPages - 1) setPage(page + 1); };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof typeof formData | "supplierName" | "supplierAddress"
    ) => {
        if (field === "supplierName" || field === "supplierAddress") {
            setFormData({ ...formData, supplier: { ...formData.supplier, [field === "supplierName" ? "name" : "address"]: e.target.value } });
        } else {
            const value = ["price", "inStock"].includes(field) ? Number(e.target.value) : e.target.value;
            setFormData({ ...formData, [field]: value });
        }
    };

    const addAttribute = () => setAttributes(prev => [...prev, emptyAttribute()]);
    const removeAttribute = (i: number) => setAttributes(prev => prev.filter((_, idx) => idx !== i));
    const updateAttribute = (i: number, field: keyof AttributeRow, value: string) =>
        setAttributes(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a));

    const validateFileSize = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            toast({ title: t("common.error"), description: `${file.name} > 5MB`, variant: "destructive" });
            return false;
        }
        return true;
    };

    const readFileAsBase64 = (file: File): Promise<string> =>
        new Promise(resolve => { const r = new FileReader(); r.onloadend = () => resolve(r.result as string); r.readAsDataURL(file); });

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !validateFileSize(file)) return;
        setFormData({ ...formData, img: await readFileAsBase64(file) });
    };

    const handleProductMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const base64List = await Promise.all(Array.from(files).filter(validateFileSize).map(readFileAsBase64));
        setFormData((prev: any) => ({ ...prev, imagesUpload: [...(prev.imagesUpload ?? []), ...base64List] }));
        e.target.value = "";
    };

    const handleRemoveImage = (index: number, type: "images" | "imagesUpload") =>
        setFormData((prev: any) => ({ ...prev, [type]: prev[type].filter((_: any, i: number) => i !== index) }));

    const isVideoBase64 = (b64: string) => b64.startsWith("data:video");

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const { images, imagesUpload, ...productData } = formData;
            const detailRequest = { attributes: attributes.filter(a => a.name.trim() !== ""), images: formData.images, imagesUpload: formData.imagesUpload ?? [] };

            // Auto-create category if the typed value doesn't match any existing keyword
            let effectiveCategory: string = formData.category;
            if (formData.category && !categories.some(c => c.keyword === formData.category)) {
                try {
                    const createRes: any = await adminApi.createCategory(formData.category);
                    const newKeyword: string = createRes.data?.result?.keyword ?? formData.category;
                    effectiveCategory = newKeyword;
                    await fetchCategories();
                } catch {
                    // Category may already exist with slightly different slug — proceed
                }
            }

            if (editingProduct) {
                await adminApi.updateProduct(editingProduct.id, { ...productData, category: effectiveCategory, productDetailCreationRequest: detailRequest });
                toast({ title: t("common.success"), description: t("product.updateSuccess") });
            } else {
                await adminApi.addProduct({ ...productData, category: effectiveCategory, productDetailCreationRequest: detailRequest });
                toast({ title: t("common.success"), description: t("product.addSuccess") });
            }
            setIsOpen(false);
            loadProducts(page, selectedCategoryFilters);
            resetForm();
        } catch (error: any) {
            toast({ title: t("common.error"), description: error.response?.data?.message || t("common.error"), variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (product: ProductType, readOnly = false) => {
        setEditingProduct(product);
        setIsReadOnly(readOnly);
        setIsLoading(true);
        try {
            const detail = (await adminApi.getProductDetail(product.id as string)).data.result;
            setFormData({
                name: product.name, img: product.img, price: product.price, unit: product.unit ?? "",
                inStock: product.inStock, category: (product as any).category ?? "",
                supplier: { name: product.supplier.name, address: product.supplier.address },
                images: detail.images || [], imagesUpload: []
            });
            setAttributes((detail.attributes ?? []).map((a: any) => ({ name: a.name ?? "", value: a.value ?? "", unit: a.unit ?? "", description: a.description ?? "" })));
        } catch {
            setFormData({ ...initialFormData, name: product.name, img: product.img, price: product.price, unit: product.unit ?? "", inStock: product.inStock, category: (product as any).category ?? "", supplier: { name: product.supplier.name, address: product.supplier.address } });
            setAttributes([]);
        } finally {
            setIsLoading(false);
            setIsOpen(true);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t("product.deleteConfirm"))) return;
        try {
            setIsDeleting(id);
            await adminApi.deleteProduct(id, token as string);
            toast({ title: t("common.success"), description: t("product.deleteSuccess") });
            loadProducts(page, selectedCategoryFilters);
        } catch {
            toast({ title: t("common.error"), description: t("product.deleteFailed"), variant: "destructive" });
        } finally {
            setIsDeleting(null);
        }
    };

    const resetForm = () => { setFormData(initialFormData); setAttributes([]); setEditingProduct(null); setIsReadOnly(false); };

    const filteredCategoriesList = categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t("product.managementTitle")}</h1>
                {activeTab === "categories" && (
                    <div className="flex gap-2">
                        <Input
                            placeholder={t("product.newCategoryPlaceholder")}
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreateCategory()}
                            className="w-64"
                        />
                        <Button onClick={handleCreateCategory} disabled={isSavingCategory || !newCategoryName.trim()}>
                            <Plus className="h-4 w-4 mr-1" />
                            {isSavingCategory ? t("product.saving") : t("product.addBtn")}
                        </Button>
                    </div>
                )}
            {activeTab === "products" && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            {t("product.importExcel")}
                        </Button>
                        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setIsOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> {t("product.addProductBtn")}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {isReadOnly ? t("product.detailsTitle") : editingProduct ? t("product.editTitle") : t("product.addTitle")}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>{t("product.productName")}</Label>
                                        <Input value={formData.name} onChange={e => handleInputChange(e, "name")} placeholder={t("product.productName")} readOnly={isReadOnly} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t("product.thumbnailImage")}</Label>
                                        <div className="space-y-2">
                                            {!isReadOnly && (
                                                <>
                                                    <input type="file" accept="image/*" className="hidden" id="product-image-upload" onChange={handleProductImageUpload} />
                                                    <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById("product-image-upload")?.click()}>
                                                        <Plus className="h-4 w-4 mr-2" /> {t("product.chooseThumbnail")}
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
                                    <div className="grid gap-2">
                                        <Label>{t("product.additionalMedia")}</Label>
                                        <div className="space-y-2">
                                            {!isReadOnly && (
                                                <>
                                                    <input type="file" accept="image/*,video/*" multiple className="hidden" id="product-media-upload" onChange={handleProductMediaUpload} />
                                                    <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById("product-media-upload")?.click()}>
                                                        <Plus className="h-4 w-4 mr-2" /> {t("product.addMedia")}
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
                                                        {isVideoBase64(src) ? <video src={src} className="w-full aspect-square object-cover rounded-md" muted /> : <img src={src} alt={`media ${i}`} className="w-full aspect-square object-cover rounded-md" />}
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>{t("product.priceVND")}</Label>
                                            <Input type="number" min="0" value={formData.price} onChange={e => handleInputChange(e, "price")} readOnly={isReadOnly} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t("product.productUnit")}</Label>
                                            <Input value={formData.unit} onChange={e => handleInputChange(e, "unit")} placeholder={t("product.unitPlaceholder")} readOnly={isReadOnly} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t("product.stockQty")}</Label>
                                        <Input type="number" min="0" value={formData.inStock} onChange={e => handleInputChange(e, "inStock")} readOnly={isReadOnly} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t("product.productCategory")}</Label>
                                        <input
                                            type="text"
                                            list="category-datalist"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            disabled={isReadOnly}
                                            placeholder={t("productExtra.selectOrTypeCategory")}
                                            autoComplete="off"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <datalist id="category-datalist">
                                            {categories.map(c => (
                                                <option key={c.id} value={c.keyword}>{c.name}</option>
                                            ))}
                                        </datalist>
                                        {formData.category && !categories.some(c => c.keyword === formData.category) && (
                                            <p className="text-xs text-blue-600 flex items-center gap-1">
                                                <Plus className="h-3 w-3" />
                                                {t("productExtra.newCategoryWillBeCreated", { name: formData.category })}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t("product.supplierInfo")}</Label>
                                        <Input placeholder={t("product.supplierNamePlaceholder")} value={formData.supplier.name} onChange={e => handleInputChange(e, "supplierName")} readOnly={isReadOnly} />
                                        <Input placeholder={t("product.supplierAddressPlaceholder")} value={formData.supplier.address} onChange={e => handleInputChange(e, "supplierAddress")} readOnly={isReadOnly} />
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-base font-semibold">{t("product.attributes")}</h3>
                                            {!isReadOnly && (
                                                <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                                                    <Plus className="h-3 w-3 mr-1" /> {t("product.attrName")} +
                                                </Button>
                                            )}
                                        </div>
                                        {attributes.length === 0 && (
                                            <p className="text-sm text-gray-400 text-center py-4">
                                                {isReadOnly ? t("product.noAttributes") : t("product.addAttributeHint")}
                                            </p>
                                        )}
                                        <div className="space-y-2">
                                            {attributes.map((attr, index) => (
                                                <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="col-span-3">
                                                        <Label className="text-xs text-gray-500 mb-1 block">{t("product.attrName")}</Label>
                                                        <Input value={attr.name} onChange={e => updateAttribute(index, "name", e.target.value)} placeholder={t("product.attrNamePlaceholder")} className="h-8 text-sm" readOnly={isReadOnly} />
                                                    </div>
                                                    <div className="col-span-4">
                                                        <Label className="text-xs text-gray-500 mb-1 block">{t("product.attrValue")}</Label>
                                                        <Input value={attr.value} onChange={e => updateAttribute(index, "value", e.target.value)} placeholder={t("product.attrValuePlaceholder")} className="h-8 text-sm" readOnly={isReadOnly} />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs text-gray-500 mb-1 block">{t("product.attrUnit")}</Label>
                                                        <Input value={attr.unit} onChange={e => updateAttribute(index, "unit", e.target.value)} placeholder={t("product.attrUnitPlaceholder")} className="h-8 text-sm" readOnly={isReadOnly} />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs text-gray-500 mb-1 block">{t("product.attrDesc")}</Label>
                                                        <Input value={attr.description} onChange={e => updateAttribute(index, "description", e.target.value)} placeholder={t("product.attrDescPlaceholder")} className="h-8 text-sm" readOnly={isReadOnly} />
                                                    </div>
                                                    {!isReadOnly && (
                                                        <div className="col-span-1 flex items-end pb-1">
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeAttribute(index)}>
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
                                            {isLoading
                                                ? (editingProduct ? t("product.updating") : t("product.adding"))
                                                : (editingProduct ? t("product.update") : t("product.add"))
                                            }
                                        </Button>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b">
                <button onClick={() => setActiveTab("products")}
                    className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === "products" ? "bg-white border border-b-white -mb-px text-primary" : "text-gray-500 hover:text-gray-700"}`}>
                    <Layers className="h-4 w-4 inline mr-1" />{t("product.tab_products")}
                </button>
                <button onClick={() => setActiveTab("categories")}
                    className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === "categories" ? "bg-white border border-b-white -mb-px text-primary" : "text-gray-500 hover:text-gray-700"}`}>
                    <Tag className="h-4 w-4 inline mr-1" />{t("product.tab_categories")}
                </button>
            </div>

            {/* Products tab */}
            {activeTab === "products" && (
                <>
                    <ImportProductDialog open={isImportOpen} onOpenChange={setIsImportOpen} onImported={() => loadProducts(page, selectedCategoryFilters)} />

                    {/* Multi-select category filter */}
                    <div className="flex items-center gap-3 mb-4">
                        <Label className="whitespace-nowrap text-sm">{t("product.filterByCategory")}:</Label>
                        <div className="relative" ref={filterDropdownRef}>
                            <button
                                onClick={() => setFilterDropdownOpen(o => !o)}
                                className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-gray-50 min-w-[180px] justify-between"
                            >
                                <span className={selectedCategoryFilters.length === 0 ? "text-gray-400" : ""}>
                                    {selectedCategoryFilters.length === 0
                                        ? t("product.allCategories")
                                        : t("product.selectedCategories", { count: selectedCategoryFilters.length })}
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </button>
                            {filterDropdownOpen && (
                                <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-md shadow-lg min-w-[200px] max-h-64 overflow-y-auto">
                                    {categories.length === 0 ? (
                                        <p className="px-3 py-2 text-sm text-gray-400">{t("product.noCategoriesYet")}</p>
                                    ) : (
                                        categories.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategoryFilters.includes(cat.keyword)}
                                                    onChange={() => toggleCategoryFilter(cat.keyword)}
                                                    className="rounded"
                                                />
                                                {cat.name}
                                            </label>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedCategoryFilters.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedCategoryFilters([]); if (page !== 0) setPage(0); }} className="h-9 px-2 text-gray-400 hover:text-gray-700">
                                <X className="h-4 w-4 mr-1" /> {t("product.clearFilter")}
                            </Button>
                        )}
                        {/* Active filter chips */}
                        <div className="flex gap-1 flex-wrap">
                            {selectedCategoryFilters.map(kw => (
                                <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                    {categories.find(c => c.keyword === kw)?.name ?? kw}
                                    <button onClick={() => toggleCategoryFilter(kw)} className="hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("product.imageLabel")}</TableHead>
                                <TableHead>{t("product.nameLabel")}</TableHead>
                                <TableHead>{t("product.productCategory")}</TableHead>
                                <TableHead>{t("product.productPrice")}</TableHead>
                                <TableHead>{t("product.unitLabel")}</TableHead>
                                <TableHead>{t("product.stockLabel")}</TableHead>
                                <TableHead>{t("product.supplierLabel")}</TableHead>
                                <TableHead>{t("product.actionsLabel")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell><img src={product.img} alt={product.name} className="w-16 h-16 object-cover" /></TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                        {(product as any).category ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                {categories.find(c => c.keyword === (product as any).category)?.name ?? (product as any).category}
                                            </span>
                                        ) : <span className="text-gray-400 text-xs">—</span>}
                                    </TableCell>
                                    <TableCell>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}</TableCell>
                                    <TableCell>{product.unit ?? "—"}</TableCell>
                                    <TableCell>{product.inStock}</TableCell>
                                    <TableCell>{product.supplier.name}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(product, true)} disabled={isLoading}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(product)} disabled={isLoading}><Pencil className="h-4 w-4" /></Button>
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
                            <ChevronLeft className="h-4 w-4" /> {t("product.previous")}
                        </Button>
                        <Button variant="outline" onClick={handleNextPage} disabled={page === totalPages - 1}>
                            {t("product.next")} <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}

            {/* Categories tab */}
            {activeTab === "categories" && (
                <div className="max-w-3xl">
                    {/* Search filter */}
                    <Input
                        placeholder={t("product.searchCategories")}
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        className="mb-3"
                    />

                    {/* Scrollable list */}
                    <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1 space-y-2">
                        {filteredCategoriesList.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">
                                {categorySearch ? t("product.noMatchingCategories") : t("product.noCategoriesInList")}
                            </p>
                        ) : (
                            filteredCategoriesList.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Tag className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <span className="text-sm font-medium truncate">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                        <span className="text-sm text-gray-500">
                                            {t("product.categoryProductCount", { count: categoryCounts[cat.keyword] ?? 0 })}
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500"
                                            disabled={isDeletingCategory === cat.id}
                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}>
                                            {isDeletingCategory === cat.id ? "..." : <Trash className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                        {t("product.categoriesCount", { x: filteredCategoriesList.length, y: categories.length })}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Product;
