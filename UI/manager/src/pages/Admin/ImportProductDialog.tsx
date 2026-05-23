import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api/adminApi";
import { CheckCircle, Download, FileSpreadsheet, Link, Loader2, Upload, XCircle } from "lucide-react";
import { useRef, useState } from "react";
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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImported: () => void;
}

// ─── constants ───────────────────────────────────────────────────────────────

const FIXED_HEADERS = [
    "Tên sản phẩm",
    "URL ảnh",
    "Giá (VND)",
    "Đơn vị",
    "Số lượng kho",
    "Nhà cung cấp",
    "Địa chỉ NCC",
    "Danh mục",
];
const TEMPLATE_ATTR_COUNT = 5;

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
        "Intel",
        "USA",
        "PC",
        "Số nhân",
        "24",
        "",
        "",
        "Số luồng",
        "32",
        "",
        "",
        "Socket",
        "LGA1700",
        "",
        "",
        "TDP",
        "125",
        "W",
        "",
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);

    // column widths
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 16) }));

    // bold header row style
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
    for (let i = 0; i < 20; i++) {
        const base = 8 + i * 4; // col 8+ after adding "Danh mục" at col 7
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
        supplier: {
            name: String(row[5] ?? "").trim(),
            address: String(row[6] ?? "").trim(),
        },
        category: String(row[7] ?? "").trim(),
        attributes,
    };
}

function parseWorkbook(wb: XLSX.WorkBook): ParsedProduct[] {
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
    return (rows.slice(1) as any[][]).map(parseRow).filter(Boolean) as ParsedProduct[];
}

function extractGoogleDriveUrl(input: string): string | null {
    const fileMatch = input.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;

    const sheetsMatch = input.match(/\/spreadsheets\/d\/([^/]+)/);
    if (sheetsMatch) return `https://docs.google.com/spreadsheets/d/${sheetsMatch[1]}/export?format=xlsx`;

    return null;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function ImportProductDialog({ open, onOpenChange, onImported }: Props) {
    const [tab, setTab] = useState<"file" | "url">("file");
    const [parsed, setParsed] = useState<ParsedProduct[]>([]);
    const [urlInput, setUrlInput] = useState("");
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<ImportResult[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setParsed([]);
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

    // ── parse from file ──────────────────────────────────────────────────────

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const wb = XLSX.read(ev.target!.result, { type: "array" });
                const products = parseWorkbook(wb);
                if (products.length === 0) {
                    toast({ title: "File trống hoặc không đúng định dạng", variant: "destructive" });
                } else {
                    setParsed(products);
                    setResults([]);
                }
            } catch {
                toast({ title: "Không thể đọc file Excel", variant: "destructive" });
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = "";
    };

    // ── parse from URL ───────────────────────────────────────────────────────

    const handleFetchUrl = async () => {
        const url = extractGoogleDriveUrl(urlInput.trim()) ?? urlInput.trim();
        if (!url) return;
        setFetchingUrl(true);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = await res.arrayBuffer();
            const wb = XLSX.read(buf, { type: "array" });
            const products = parseWorkbook(wb);
            if (products.length === 0) {
                toast({ title: "File trống hoặc không đúng định dạng", variant: "destructive" });
            } else {
                setParsed(products);
                setResults([]);
            }
        } catch (err: any) {
            const msg =
                err.message?.includes("CORS") || err.message?.includes("Failed to fetch")
                    ? "Không thể tải file do giới hạn CORS. Hãy tải file về máy rồi upload trực tiếp."
                    : `Lỗi: ${err.message}`;
            toast({ title: "Không thể tải file", description: msg, variant: "destructive" });
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

        const resultList: ImportResult[] = [];
        for (let i = 0; i < parsed.length; i++) {
            const p = parsed[i];
            try {
                await adminApi.addProduct({
                    name: p.name,
                    img: p.img,
                    price: p.price,
                    unit: p.unit,
                    inStock: p.inStock,
                    category: p.category || undefined,
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

        setImporting(false);
        const successCount = resultList.filter((r) => r.status === "success").length;
        toast({ title: `Import xong: ${successCount}/${parsed.length} sản phẩm thành công` });
        if (successCount > 0) onImported();
    };

    const doneImporting = !importing && results.length > 0;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        Import sản phẩm từ Excel
                    </DialogTitle>
                </DialogHeader>

                {/* ── template download ── */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                        <p className="text-sm font-medium text-green-800">Tải file mẫu</p>
                        <p className="text-xs text-green-600">7 cột cố định + tối đa 20 thuộc tính tùy chọn</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-green-500 text-green-700 hover:bg-green-100" onClick={downloadTemplate}>
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
                            Upload file
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "url" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setTab("url")}
                        >
                            <Link className="inline h-4 w-4 mr-1" />
                            Google Drive / Sheets URL
                        </button>
                    </div>
                )}

                {/* ── file upload ── */}
                {tab === "file" && !doneImporting && (
                    <div className="space-y-3">
                        <Label>Chọn file Excel (.xlsx / .xls)</Label>
                        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                        <Button variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()}>
                            <Upload className="h-4 w-4" />
                            {parsed.length > 0 ? `Đã chọn — ${parsed.length} sản phẩm` : "Chọn file..."}
                        </Button>
                    </div>
                )}

                {/* ── url input ── */}
                {tab === "url" && !doneImporting && (
                    <div className="space-y-3">
                        <Label>Link Google Drive hoặc Google Sheets</Label>
                        <p className="text-xs text-gray-500">
                            File Google Drive phải được đặt chế độ "Anyone with the link" có thể xem.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://drive.google.com/file/d/... hoặc https://docs.google.com/spreadsheets/d/..."
                                className="flex-1"
                            />
                            <Button onClick={handleFetchUrl} disabled={!urlInput.trim() || fetchingUrl}>
                                {fetchingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tải"}
                            </Button>
                        </div>
                        {parsed.length > 0 && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Đọc thành công — {parsed.length} sản phẩm
                            </p>
                        )}
                    </div>
                )}

                {/* ── preview table ── */}
                {parsed.length > 0 && !doneImporting && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Xem trước ({parsed.length} dòng)</p>
                        <div className="border rounded-lg overflow-auto max-h-64">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-2 text-left">#</th>
                                        <th className="px-2 py-2 text-left">Tên</th>
                                        <th className="px-2 py-2 text-left">Giá</th>
                                        <th className="px-2 py-2 text-left">Đơn vị</th>
                                        <th className="px-2 py-2 text-left">Kho</th>
                                        <th className="px-2 py-2 text-left">Nhà CC</th>
                                        <th className="px-2 py-2 text-left">Thuộc tính</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsed.map((p, i) => (
                                        <tr key={i} className="border-t hover:bg-gray-50">
                                            <td className="px-2 py-1 text-gray-400">{i + 1}</td>
                                            <td className="px-2 py-1 font-medium max-w-[160px] truncate">{p.name}</td>
                                            <td className="px-2 py-1 whitespace-nowrap">
                                                {p.price.toLocaleString("vi-VN")}đ
                                            </td>
                                            <td className="px-2 py-1">{p.unit || "—"}</td>
                                            <td className="px-2 py-1">{p.inStock}</td>
                                            <td className="px-2 py-1">{p.supplier.name}</td>
                                            <td className="px-2 py-1 text-gray-500">{p.attributes.length} thuộc tính</td>
                                        </tr>
                                    ))}
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
                            Đang nhập... ({progress}/{parsed.length})
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
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">
                                {results.filter((r) => r.status === "success").length} thành công
                            </span>
                            {results.some((r) => r.status === "error") && (
                                <>
                                    <XCircle className="h-5 w-5 text-red-500 ml-2" />
                                    <span className="text-sm font-medium text-red-600">
                                        {results.filter((r) => r.status === "error").length} lỗi
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="border rounded-lg overflow-auto max-h-56">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-2 text-left">#</th>
                                        <th className="px-2 py-2 text-left">Tên</th>
                                        <th className="px-2 py-2 text-left">Kết quả</th>
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
                                                    <span className="text-red-600 flex items-center gap-1">
                                                        <XCircle className="h-3 w-3" /> {r.message}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Button onClick={() => handleClose(false)} className="w-full">Đóng</Button>
                    </div>
                )}

                {/* ── action bar ── */}
                {!doneImporting && (
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={() => handleClose(false)} disabled={importing}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={parsed.length === 0 || importing}
                            className="gap-2"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang nhập...
                                </>
                            ) : (
                                `Import ${parsed.length > 0 ? `(${parsed.length})` : ""}`
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
