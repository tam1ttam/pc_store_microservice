import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api/adminApi";
import { AlertTriangle, CheckCircle, Download, FileSpreadsheet, Link, Loader2, RefreshCw, Upload, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";

// ─── types ───────────────────────────────────────────────────────────────────

interface ParsedProduct {
    name: string;
    img: string;
    price: number;
    unit: string;
    inStock: number;
    category: string;
    supplier: { name: string; address: string };
    attributes: { name: string; value: string; unit: string; description: string }[];
}

interface ImportResult {
    index: number;
    name: string;
    status: "success" | "error";
    message?: string;
}

interface ValidationWarning {
    row: number;
    name: string;
    issues: string[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImported: () => void;
}

// ─── constants ───────────────────────────────────────────────────────────────

/**
 * Thứ tự cột cố định đúng theo Product entity:
 * name, img, price, unit, inStock, category, supplier.name, supplier.address
 */
const FIXED_HEADERS = [
    "Tên sản phẩm",    // col 0
    "URL ảnh",         // col 1
    "Giá (VND)",       // col 2
    "Đơn vị",          // col 3
    "Số lượng kho",    // col 4
    "Danh mục",        // col 5
    "Nhà cung cấp",    // col 6
    "Địa chỉ NCC",     // col 7
];
const TEMPLATE_ATTR_COUNT = 5;
const MAX_ATTR_COUNT = 20;

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildTemplateHeaders(): string[] {
    const headers = [...FIXED_HEADERS];
    for (let i = 1; i <= TEMPLATE_ATTR_COUNT; i++) {
        headers.push(
            `Thuộc tính ${i} - Tên`,
            `Thuộc tính ${i} - Giá trị`,
            `Thuộc tính ${i} - Đơn vị`,
            `Thuộc tính ${i} - Mô tả`
        );
    }
    return headers;
}

function downloadTemplate() {
    const headers = buildTemplateHeaders();
    const example = [
        "Intel Core i9-14900K",
        "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400",
        12990000,
        "chiếc",
        100,
        "CPU",
        "Intel",
        "USA",
        "Số nhân", "24", "", "",
        "Số luồng", "32", "", "",
        "Socket", "LGA1700", "", "",
        "TDP", "125", "W", "",
        "Cache L3", "36", "MB", "",
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);

    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 16) }));

    headers.forEach((_, ci) => {
        const ref = XLSX.utils.encode_cell({ r: 0, c: ci });
        if (ws[ref]) ws[ref].s = { font: { bold: true } };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "product_template.xlsx");
}

function parseRow(row: any[]): ParsedProduct | null {
    const name = String(row[0] ?? "").trim();
    if (!name) return null;

    const attributes: ParsedProduct["attributes"] = [];
    for (let i = 0; i < MAX_ATTR_COUNT; i++) {
        const base = 8 + i * 4;
        const attrName = String(row[base] ?? "").trim();
        if (!attrName) continue;
        attributes.push({
            name: attrName,
            value: String(row[base + 1] ?? "").trim(),
            unit: String(row[base + 2] ?? "").trim(),
            description: String(row[base + 3] ?? "").trim(),
        });
    }

    return {
        name,
        img: String(row[1] ?? "").trim(),
        price: Number(row[2]) || 0,
        unit: String(row[3] ?? "").trim(),
        inStock: Number(row[4]) || 0,
        category: String(row[5] ?? "").trim().toLowerCase(),
        supplier: {
            name: String(row[6] ?? "").trim(),
            address: String(row[7] ?? "").trim(),
        },
        attributes,
    };
}

function parseWorkbook(wb: XLSX.WorkBook): ParsedProduct[] {
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
    return (rows.slice(1) as any[][]).map(parseRow).filter(Boolean) as ParsedProduct[];
}

function extractGoogleUrls(input: string): { xlsxUrl: string | null; csvUrl: string | null } {
    const sheetsMatch = input.match(/\/spreadsheets\/d\/([^/?#]+)/);
    if (sheetsMatch) {
        const id = sheetsMatch[1];
        const gidMatch = input.match(/[#?&]gid=(\d+)/);
        const gid = gidMatch ? gidMatch[1] : "0";
        return {
            csvUrl: `https://docs.google.com/spreadsheets/d/${id}/pub?gid=${gid}&single=true&output=csv`,
            xlsxUrl: `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`,
        };
    }

    const fileMatch = input.match(/\/file\/d\/([^/?#]+)/);
    if (fileMatch) {
        return {
            xlsxUrl: `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`,
            csvUrl: null,
        };
    }

    return { xlsxUrl: null, csvUrl: null };
}

// ─── component ───────────────────────────────────────────────────────────────

type AttrTooltip = {
    attrs: { name: string; value: string; unit: string; description: string }[];
    x: number;
    y: number;
};

export default function ImportProductDialog({ open, onOpenChange, onImported }: Props) {
    const { t } = useTranslation();
    const [tab, setTab] = useState<"file" | "url">("file");
    const [parsed, setParsed] = useState<ParsedProduct[]>([]);
    const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
    const [urlInput, setUrlInput] = useState("");
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<ImportResult[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);
    // Tooltip for attribute preview on hover
    const [attrTooltip, setAttrTooltip] = useState<AttrTooltip | null>(null);
    // Known category keywords fetched on open — used to detect new categories
    const [knownCategoryKeywords, setKnownCategoryKeywords] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (open) {
            adminApi.listCategories()
                .then((res: any) => {
                    const cats: { keyword: string }[] = res.data?.result ?? [];
                    setKnownCategoryKeywords(new Set(cats.map(c => c.keyword)));
                })
                .catch(() => { /* non-fatal */ });
        }
    }, [open]);

    const validateProducts = (products: ParsedProduct[]): ValidationWarning[] => {
        return products
            .map((p, i) => {
                const issues: string[] = [];
                if (!p.name) issues.push(t("import.missingName"));
                if (p.price <= 0) issues.push(t("import.invalidPrice"));
                if (p.inStock < 0) issues.push(t("import.invalidStock"));
                if (!p.img) issues.push(t("import.missingImg"));
                return issues.length > 0 ? { row: i + 1, name: p.name || `Dòng ${i + 2}`, issues } : null;
            })
            .filter(Boolean) as ValidationWarning[];
    };

    const reset = () => {
        setParsed([]);
        setWarnings([]);
        setUrlInput("");
        setResults([]);
        setProgress(0);
    };

    const handleClose = (v: boolean) => {
        if (!importing) {
            onOpenChange(v);
            if (!v) reset();
        }
    };

    const applyParsed = (products: ParsedProduct[]) => {
        if (products.length === 0) {
            toast({ title: t("import.emptyOrInvalid"), variant: "destructive" });
            return;
        }
        const w = validateProducts(products);
        setParsed(products);
        setWarnings(w);
        setResults([]);
    };

    // ── parse from file ──────────────────────────────────────────────────────

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const wb = XLSX.read(ev.target!.result, { type: "array" });
                applyParsed(parseWorkbook(wb));
            } catch {
                toast({ title: t("import.readError"), variant: "destructive" });
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = "";
    };

    // ── parse from URL ───────────────────────────────────────────────────────

    const handleFetchUrl = async () => {
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        setFetchingUrl(true);

        const { xlsxUrl, csvUrl } = extractGoogleUrls(trimmed);

        if (csvUrl) {
            try {
                const res = await fetch(csvUrl);
                if (res.ok) {
                    const text = await res.text();
                    const wb = XLSX.read(text, { type: "string" });
                    const products = parseWorkbook(wb);
                    applyParsed(products);
                    setFetchingUrl(false);
                    return;
                }
            } catch {
                // fall through
            }
        }

        const finalUrl = xlsxUrl ?? trimmed;
        try {
            const res = await fetch(finalUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = await res.arrayBuffer();
            const wb = XLSX.read(buf, { type: "array" });
            applyParsed(parseWorkbook(wb));
        } catch (err: any) {
            const isCors =
                err.message?.includes("CORS") ||
                err.message?.includes("Failed to fetch") ||
                err.message?.includes("NetworkError");
            toast({
                title: t("import.fetchError"),
                description: isCors
                    ? t("import.urlNoteDesc")
                    : `Lỗi: ${err.message}`,
                variant: "destructive",
            });
        } finally {
            setFetchingUrl(false);
        }
    };

    // ── import ───────────────────────────────────────────────────────────────

    const handleImport = async () => {
        if (parsed.length === 0) return;
        setImporting(true);
        setProgress(0);
        setResults([]);

        // Local mutable set — avoid stale closure on state
        const knownCats = new Set(knownCategoryKeywords);

        const resultList: ImportResult[] = [];
        for (let i = 0; i < parsed.length; i++) {
            const p = parsed[i];
            try {
                // Auto-create category if not in known list
                let effectiveCategory: string | undefined = p.category || undefined;
                if (p.category && !knownCats.has(p.category)) {
                    try {
                        const createRes: any = await adminApi.createCategory(p.category);
                        const created = createRes.data?.result;
                        const newKeyword: string = created?.keyword ?? p.category;
                        knownCats.add(p.category);
                        knownCats.add(newKeyword);
                        effectiveCategory = newKeyword;
                    } catch {
                        // Creation failed (may already exist with different casing) — proceed with typed value
                    }
                }

                await adminApi.addProduct({
                    name: p.name,
                    img: p.img,
                    price: p.price,
                    unit: p.unit,
                    inStock: p.inStock,
                    category: effectiveCategory,
                    supplier: p.supplier,
                    productDetailCreationRequest: {
                        attributes: p.attributes.filter((a) => a.name),
                        images: [],
                        imagesUpload: [],
                    },
                });
                resultList.push({ index: i, name: p.name, status: "success" });
            } catch (err: any) {
                resultList.push({
                    index: i,
                    name: p.name,
                    status: "error",
                    message: err?.response?.data?.message ?? err.message ?? "Lỗi không xác định",
                });
            }
            setProgress(i + 1);
            setResults([...resultList]);
        }

        // Sync updated known keywords back to state
        setKnownCategoryKeywords(new Set(knownCats));

        setImporting(false);
        const successCount = resultList.filter((r) => r.status === "success").length;
        toast({ title: t("import.importDone", { success: successCount, total: parsed.length }) });
        if (successCount > 0) onImported();
    };

    const doneImporting = !importing && results.length > 0;
    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        {t("import.title")}
                    </DialogTitle>
                </DialogHeader>

                {/* ── template download ── */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                        <p className="text-sm font-medium text-green-800">{t("import.downloadTemplate")}</p>
                        <p className="text-xs text-green-600">
                            {t("import.templateDesc", { max: MAX_ATTR_COUNT })}
                        </p>
                        <p className="text-xs text-green-500 mt-0.5">
                            {t("import.templateColumns")}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-green-500 text-green-700 hover:bg-green-100 flex-shrink-0 ml-3"
                        onClick={downloadTemplate}
                    >
                        <Download className="h-4 w-4" />
                        product_template.xlsx
                    </Button>
                </div>

                {/* ── tabs ── */}
                {!doneImporting && (
                    <div className="flex gap-1 border-b">
                        <button
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "file" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setTab("file")}
                        >
                            <Upload className="inline h-4 w-4 mr-1" />
                            {t("import.tabFile")}
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "url" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setTab("url")}
                        >
                            <Link className="inline h-4 w-4 mr-1" />
                            {t("import.tabUrl")}
                        </button>
                    </div>
                )}

                {/* ── file upload ── */}
                {tab === "file" && !doneImporting && (
                    <div className="space-y-3">
                        <Label>{t("import.chooseFile")}</Label>
                        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                        <Button variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()}>
                            <Upload className="h-4 w-4" />
                            {parsed.length > 0
                                ? t("import.fileSelected", { count: parsed.length })
                                : t("import.chooseFileBtn")}
                        </Button>
                    </div>
                )}

                {/* ── url input ── */}
                {tab === "url" && !doneImporting && (
                    <div className="space-y-3">
                        <Label>{t("import.urlLabel")}</Label>
                        <div className="p-2.5 bg-blue-50 rounded-md border border-blue-100 text-xs text-blue-700 space-y-1">
                            <p className="font-medium">{t("import.urlNote")}</p>
                            <p>{t("import.urlNoteDesc")}</p>
                            <p>{t("import.urlNoteFallback")}</p>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                                placeholder={t("import.urlPlaceholder")}
                                className="flex-1"
                            />
                            <Button onClick={handleFetchUrl} disabled={!urlInput.trim() || fetchingUrl}>
                                {fetchingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : t("import.fetch")}
                            </Button>
                        </div>
                        {parsed.length > 0 && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                {t("import.fetchSuccess", { count: parsed.length })}
                            </p>
                        )}
                    </div>
                )}

                {/* ── validation warnings ── */}
                {warnings.length > 0 && !doneImporting && (
                    <div className="border border-yellow-200 rounded-lg bg-yellow-50 p-3 space-y-2">
                        <p className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {t("import.warningsTitle", { count: warnings.length })}
                        </p>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                            {warnings.map((w) => (
                                <p key={w.row} className="text-xs text-yellow-700">
                                    <span className="font-medium">Dòng {w.row + 1} "{w.name}":</span>{" "}
                                    {w.issues.join(", ")}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── preview table ── */}
                {parsed.length > 0 && !doneImporting && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">{t("import.previewTitle", { count: parsed.length })}</p>
                        <div className="border rounded-lg overflow-auto max-h-64">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-2 text-left">{t("import.colNo")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colName")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colPrice")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colUnit")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colStock")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colCategory")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colSupplier")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colAttributes")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsed.map((p, i) => {
                                        const hasWarning = warnings.some((w) => w.row === i);
                                        return (
                                            <tr
                                                key={i}
                                                className={`border-t ${hasWarning ? "bg-yellow-50" : "hover:bg-gray-50"}`}
                                            >
                                                <td className="px-2 py-1 text-gray-400">
                                                    {hasWarning ? <AlertTriangle className="h-3 w-3 text-yellow-500 inline" /> : i + 1}
                                                </td>
                                                <td className="px-2 py-1 font-medium max-w-[140px] truncate">{p.name}</td>
                                                <td className="px-2 py-1 whitespace-nowrap">
                                                    {p.price.toLocaleString("vi-VN")}đ
                                                </td>
                                                <td className="px-2 py-1">{p.unit || "—"}</td>
                                                <td className="px-2 py-1">{p.inStock}</td>
                                                <td className="px-2 py-1">
                                                    {p.category ? (
                                                        <span className="inline-flex px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                                            {p.category}
                                                        </span>
                                                    ) : "—"}
                                                </td>
                                                <td className="px-2 py-1 max-w-[100px] truncate">{p.supplier.name || "—"}</td>
                                                <td className="px-2 py-1 text-gray-500">
                                                    {t("import.attributeCount", { count: p.attributes.length })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── progress ── */}
                {importing && (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("import.importingProgress", { current: progress, total: parsed.length })}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${(progress / parsed.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* ── results ── */}
                {doneImporting && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                {t("import.successCount", { count: successCount })}
                            </span>
                            {errorCount > 0 && (
                                <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                                    <XCircle className="h-5 w-5" />
                                    {t("import.errorCount", { count: errorCount })}
                                </span>
                            )}
                        </div>
                        <div className="border rounded-lg overflow-auto max-h-56">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-2 text-left">{t("import.colNo")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colName")}</th>
                                        <th className="px-2 py-2 text-left">{t("import.colResult")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r) => (
                                        <tr key={r.index} className="border-t">
                                            <td className="px-2 py-1 text-gray-400">{r.index + 1}</td>
                                            <td className="px-2 py-1 max-w-[200px] truncate">{r.name}</td>
                                            <td className="px-2 py-1">
                                                {r.status === "success" ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> OK
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600 flex items-center gap-1 max-w-xs">
                                                        <XCircle className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate" title={r.message}>{r.message}</span>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2" onClick={reset}>
                                <RefreshCw className="h-4 w-4" />
                                {t("import.importMore")}
                            </Button>
                            <Button className="flex-1" onClick={() => handleClose(false)}>{t("import.close")}</Button>
                        </div>
                    </div>
                )}

                {/* ── action bar ── */}
                {!doneImporting && (
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={() => handleClose(false)} disabled={importing}>
                            {t("import.cancel")}
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={parsed.length === 0 || importing}
                            className="gap-2"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("import.importing")}
                                </>
                            ) : (
                                parsed.length > 0
                                    ? t("import.importWithCount", { count: parsed.length })
                                    : t("import.import")
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
