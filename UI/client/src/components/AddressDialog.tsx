/**
 * AddressDialog — form nhập địa chỉ có cấu trúc + bản đồ Leaflet/OpenStreetMap
 *
 * Map:     react-leaflet + OpenStreetMap tiles (hoàn toàn free, không cần API key)
 * Geocode: Nominatim API (free) — reverse geocode khi click/drag bản đồ,
 *          forward search khi gõ vào ô tìm kiếm
 */

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MapPin, Plus, X, Navigation, Search, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/services/api/userApi";
import type { Address } from "@/types";
import type { RootState } from "@/redux/store";

// ─── Fix Leaflet default marker icon trong Vite ────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Constants ─────────────────────────────────────────────────────────────
const DEFAULT_CENTER: [number, number] = [10.762622, 106.660172]; // TP.HCM
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const UA_HEADER = { "User-Agent": "iluttmab-pc-store/1.0 (contact@example.com)" };

// ─── Nominatim types ────────────────────────────────────────────────────────
interface NominatimAddr {
    country?: string;
    state?: string;
    province?: string;
    county?: string;
    city?: string;
    city_district?: string;
    district?: string;
    town?: string;
    village?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    road?: string;
    house_number?: string;
    [key: string]: string | undefined;
}

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
    address?: NominatimAddr;
}

// ─── Address form type ─────────────────────────────────────────────────────
// Export để Checkout/ProfileCompletionModal có thể nhận structured data
export interface AddressFormData {
    country: string;
    province: string;
    city: string;
    ward: string;
    street: string;
    phoneContacts: string[];
}

type AddressForm = AddressFormData;

function emptyForm(): AddressForm {
    return { country: "Việt Nam", province: "", city: "", ward: "", street: "", phoneContacts: [""] };
}

function formatAddress(f: AddressForm): string {
    return [f.street, f.ward, f.city, f.province, f.country !== "Việt Nam" ? f.country : ""]
        .filter(Boolean)
        .join(", ");
}

function formatAddressFromEntity(a: Address): string {
    return [a.street, a.ward, a.city, a.province, (a.country && a.country !== "Việt Nam") ? a.country : ""]
        .filter(Boolean)
        .join(", ");
}

// ─── Nominatim helpers ───────────────────────────────────────────────────────
function addrFromNominatim(addr: NominatimAddr): Partial<AddressForm> {
    const province =
        addr.state || addr.province || addr.county || addr.city || "";
    const tookCityForProvince = !addr.state && !addr.province && !addr.county && !!addr.city;
    const city =
        addr.city_district || addr.district || addr.suburb ||
        (!tookCityForProvince ? addr.city : "") ||
        addr.town || addr.village || "";
    const ward = addr.neighbourhood || addr.quarter || "";
    return {
        country: addr.country || "Việt Nam",
        province, city, ward,
        street: [addr.house_number, addr.road].filter(Boolean).join(" "),
    };
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
    return null;
}

function MapController({ flyTo }: { flyTo: [number, number] | null }) {
    const map = useMap();
    useEffect(() => { if (flyTo) map.flyTo(flyTo, 16); }, [flyTo]); // eslint-disable-line
    return null;
}

// ─── Save result type ──────────────────────────────────────────────────────
type SaveResult = "saved_default" | "saved_list" | "duplicate_list" | "skipped";

// ─── Props ─────────────────────────────────────────────────────────────────
interface Props {
    open: boolean;
    onClose: () => void;
    /** formattedAddress = chuỗi hiển thị; formData = object có cấu trúc để truyền sang modal khác */
    onSave: (formattedAddress: string, formData: AddressFormData) => void;
    /** Địa chỉ đang được dùng — điền sẵn khi mở lại dialog (ưu tiên hơn địa chỉ mặc định profile) */
    initialFormData?: AddressFormData | null;
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function AddressDialog({ open, onClose, onSave, initialFormData }: Props) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const user = useSelector((state: RootState) => state.user.info);

    // ── Form state ─────────────────────────────────────────────────────────
    const [form, setForm] = useState<AddressForm>(emptyForm);
    const [showMap, setShowMap] = useState(false);
    const [markerPos, setMarkerPos] = useState<[number, number]>(DEFAULT_CENTER);
    const [mapCenter] = useState<[number, number]>(DEFAULT_CENTER);
    const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

    // ── Search state ───────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // ── Validation errors ──────────────────────────────────────────────────
    const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});

    // ── Save options ───────────────────────────────────────────────────────
    const [saveAsDefault, setSaveAsDefault] = useState(false);
    const [addToList, setAddToList] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastGeocode = useRef(0);

    // Địa chỉ đã lưu (từ Redux state — không cần API call thêm)
    const existingAddresses: Address[] = user?.addresses ?? [];

    // ── Reset + pre-fill khi mở dialog ─────────────────────────────────────
    useEffect(() => {
        if (open) {
            setErrors({});
            setShowMap(false);
            setMarkerPos(DEFAULT_CENTER);
            setFlyTarget(null);
            setSearchQuery("");
            setSearchResults([]);
            setShowSuggestions(false);
            setSaveAsDefault(false);
            setAddToList(false);

            // Ưu tiên 1: địa chỉ đang được dùng ở Checkout (user đã chọn trước đó)
            if (initialFormData && (initialFormData.province || initialFormData.street)) {
                setForm({
                    country:      initialFormData.country  || "Việt Nam",
                    province:     initialFormData.province || "",
                    city:         initialFormData.city     || "",
                    ward:         initialFormData.ward     || "",
                    street:       initialFormData.street   || "",
                    phoneContacts: initialFormData.phoneContacts?.length
                        ? [...initialFormData.phoneContacts]
                        : [""],
                });
                return;
            }

            // Ưu tiên 2: địa chỉ mặc định trong profile (isDefault: true)
            const defaultAddr = existingAddresses.find((a) => a.isDefault === true);
            if (defaultAddr) {
                setForm({
                    country:      defaultAddr.country  || "Việt Nam",
                    province:     defaultAddr.province || "",
                    city:         defaultAddr.city     || "",
                    ward:         defaultAddr.ward     || "",
                    street:       defaultAddr.street   || "",
                    phoneContacts: defaultAddr.phoneContacts?.length
                        ? [...defaultAddr.phoneContacts]
                        : [""],
                });
                return;
            }

            // Mặc định: form trống
            setForm(emptyForm());
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Chọn địa chỉ có sẵn ────────────────────────────────────────────────
    const handleSelectExisting = (addr: Address) => {
        setForm({
            country: addr.country || "Việt Nam",
            province: addr.province || "",
            city: addr.city || "",
            ward: addr.ward || "",
            street: addr.street || "",
            phoneContacts: addr.phoneContacts?.length ? [...addr.phoneContacts] : [""],
        });
        setErrors({});
    };

    // ── Field helpers ───────────────────────────────────────────────────────
    const setField = (key: keyof AddressForm, value: string) => {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((p) => ({ ...p, [key]: undefined }));
    };

    const setPhone = (i: number, value: string) =>
        setForm((p) => {
            const phones = [...p.phoneContacts];
            phones[i] = value;
            return { ...p, phoneContacts: phones };
        });

    const addPhone = () =>
        setForm((p) => ({ ...p, phoneContacts: [...p.phoneContacts, ""] }));

    const removePhone = (i: number) =>
        setForm((p) => ({ ...p, phoneContacts: p.phoneContacts.filter((_, idx) => idx !== i) }));

    // ── Nominatim helpers ───────────────────────────────────────────────────
    const applyNominatimAddr = useCallback((addr: NominatimAddr) => {
        const parsed = addrFromNominatim(addr);
        setForm((p) => ({ ...p, ...parsed }));
        setErrors({});
    }, []);

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        const now = Date.now();
        if (now - lastGeocode.current < 1000) return;
        lastGeocode.current = now;
        setIsReverseGeocoding(true);
        try {
            const res = await fetch(
                `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi&zoom=18`,
                { headers: UA_HEADER }
            );
            const data: { address?: NominatimAddr } = await res.json();
            if (data.address) applyNominatimAddr(data.address);
        } catch { /* non-fatal */ }
        finally { setIsReverseGeocoding(false); }
    }, [applyNominatimAddr]);

    const handleMapClick = useCallback(
        (lat: number, lng: number) => { setMarkerPos([lat, lng]); reverseGeocode(lat, lng); },
        [reverseGeocode]
    );

    const handleDragEnd = useCallback(
        (e: L.DragEndEvent) => {
            const { lat, lng } = (e.target as L.Marker).getLatLng();
            setMarkerPos([lat, lng]);
            reverseGeocode(lat, lng);
        },
        [reverseGeocode]
    );

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (!value.trim()) { setSearchResults([]); setShowSuggestions(false); return; }
        searchTimer.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=6&accept-language=vi`,
                    { headers: UA_HEADER }
                );
                const data: NominatimResult[] = await res.json();
                setSearchResults(data);
                setShowSuggestions(true);
            } catch { setSearchResults([]); }
            finally { setIsSearching(false); }
        }, 500);
    };

    const handleSelectSuggestion = (result: NominatimResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const pos: [number, number] = [lat, lng];
        setMarkerPos(pos);
        setFlyTarget(pos);
        if (result.address) applyNominatimAddr(result.address);
        setSearchQuery(result.display_name);
        setShowSuggestions(false);
    };

    const handleMyLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const pos: [number, number] = [coords.latitude, coords.longitude];
                setMarkerPos(pos);
                setFlyTarget(pos);
                await reverseGeocode(coords.latitude, coords.longitude);
            },
            () => { /* permission denied */ }
        );
    };

    // ── Validate ────────────────────────────────────────────────────────────
    const validate = () => {
        const errs: Partial<Record<keyof AddressForm, string>> = {};
        if (!form.province.trim()) errs.province = t("checkout.provinceRequired");
        if (!form.city.trim()) errs.city = t("checkout.cityRequired");
        if (!form.ward.trim()) errs.ward = t("checkout.wardRequired");
        if (!form.street.trim()) errs.street = t("checkout.streetRequired");
        if (!form.phoneContacts.some((p) => p.trim().length > 0))
            errs.phoneContacts = t("checkout.phoneRequired");
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Lưu địa chỉ vào profile ─────────────────────────────────────────────
    const saveAddressToProfile = async (): Promise<SaveResult> => {
        if (!user) return "skipped";
        // Cần đủ thông tin bắt buộc để gọi completeProfile
        if (!user.firstName || !user.lastName || !user.email || !user.phoneNumber) return "skipped";

        const currentAddresses = existingAddresses;
        const newAddr = {
            country: form.country,
            province: form.province,
            city: form.city,
            ward: form.ward,
            street: form.street,
            isDefault: saveAsDefault,
            phoneContacts: form.phoneContacts.filter((p) => p.trim()),
        };

        // Kiểm tra trùng lặp (so sánh case-insensitive)
        const dupIdx = currentAddresses.findIndex(
            (a) =>
                a.province?.toLowerCase() === newAddr.province.toLowerCase() &&
                a.city?.toLowerCase() === newAddr.city.toLowerCase() &&
                a.ward?.toLowerCase() === newAddr.ward.toLowerCase() &&
                a.street?.toLowerCase() === newAddr.street.toLowerCase()
        );

        // Helper: chuyển Address entity → AddressRequest format
        const toReq = (a: Address, overrideDefault?: boolean) => ({
            country: a.country || "Việt Nam",
            province: a.province || "",
            city: a.city || "",
            ward: a.ward || "",
            street: a.street || "",
            isDefault: overrideDefault !== undefined ? overrideDefault : !!(a.isDefault),
            phoneContacts: a.phoneContacts ?? [],
        });

        // Khi cả hai tick: saveAsDefault có quyền ưu tiên → một lần API duy nhất
        const effectiveDefault = saveAsDefault;

        let updatedAddresses: ReturnType<typeof toReq>[];
        let resultType: SaveResult;

        if (dupIdx >= 0 && !effectiveDefault && !addToList) {
            // Không tick gì (không thể xảy ra vì caller đã kiểm tra) — bỏ qua
            return "skipped";
        } else if (dupIdx >= 0 && !effectiveDefault) {
            // Địa chỉ đã tồn tại, chỉ "thêm vào danh sách" → đã có rồi, không thêm lại
            return "duplicate_list";
        } else if (dupIdx >= 0 && effectiveDefault) {
            // Địa chỉ đã tồn tại → set nó thành default, tắt các cái còn lại
            updatedAddresses = currentAddresses.map((a, i) =>
                toReq(a, i === dupIdx)
            );
            resultType = "saved_default";
        } else if (effectiveDefault) {
            // Địa chỉ mới → tắt isDefault cũ, thêm mới làm mặc định
            updatedAddresses = [
                ...currentAddresses.map((a) => toReq(a, false)),
                newAddr,
            ];
            resultType = "saved_default";
        } else {
            // Chỉ "thêm vào danh sách" (isDefault: false)
            updatedAddresses = [
                ...currentAddresses.map((a) => toReq(a)),
                newAddr,
            ];
            resultType = "saved_list";
        }

        await userApi.completeProfile({
            firstName: user.firstName!,
            lastName: user.lastName!,
            email: user.email!,
            phoneNumber: user.phoneNumber!,
            dob: user.dob,
            city: user.city,
            gender: user.gender,
            defaultPhoneNumber: user.defaultPhoneNumber,
            defaultEmail: user.defaultEmail,
            addresses: updatedAddresses,
        });
        return resultType;
    };

    const handleSave = async () => {
        if (!validate()) return;

        if (saveAsDefault || addToList) {
            setIsSaving(true);
            try {
                const result = await saveAddressToProfile();
                if (result === "saved_default") {
                    toast({ title: t("checkout.savedAsDefault") });
                } else if (result === "saved_list") {
                    toast({ title: t("checkout.savedToList") });
                } else if (result === "duplicate_list") {
                    toast({ title: t("checkout.addressAlreadyInList") });
                }
            } catch {
                toast({ variant: "destructive", title: t("common.error") });
            } finally {
                setIsSaving(false);
            }
        }

        onSave(formatAddress(form), { ...form });
        onClose();
    };

    const preview = formatAddress(form);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        {t("checkout.addressDialog")}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-1">

                    {/* ── Địa chỉ đã lưu ────────────────────────────────── */}
                    {existingAddresses.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-600">
                                {t("checkout.existingAddresses")}
                            </Label>
                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {existingAddresses.map((addr, i) => (
                                    <button
                                        key={addr.id ?? i}
                                        type="button"
                                        onClick={() => handleSelectExisting(addr)}
                                        className="w-full text-left p-2.5 rounded-lg border text-sm transition-colors hover:border-orange-400 hover:bg-orange-50 border-gray-200"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                                    {addr.isDefault && (
                                                        <span className="inline-flex items-center gap-0.5 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {t("checkout.defaultBadge")}
                                                        </span>
                                                    )}
                                                    <span className="text-gray-700 truncate">
                                                        {formatAddressFromEntity(addr)}
                                                    </span>
                                                </div>
                                                {addr.phoneContacts && addr.phoneContacts.length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {addr.phoneContacts[0]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <Separator />
                        </div>
                    )}

                    {/* ── Action bar ────────────────────────────────────── */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-dashed border-orange-300 text-orange-500 hover:bg-orange-50"
                            onClick={() => setShowMap((s) => !s)}
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            {showMap ? t("checkout.hideMap") : t("checkout.pickOnMap")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title={t("checkout.myLocation")}
                            className="border-orange-300 text-orange-500 hover:bg-orange-50 shrink-0"
                            onClick={handleMyLocation}
                        >
                            <Navigation className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* ── Search + Embedded Map ─────────────────────────── */}
                    {showMap && (
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 pr-9"
                                    placeholder={t("checkout.searchAddress")}
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-orange-400" />
                                )}
                                {showSuggestions && searchResults.length > 0 && (
                                    <div className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                        {searchResults.map((r, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 border-b last:border-0 transition-colors truncate"
                                                onMouseDown={() => handleSelectSuggestion(r)}
                                            >
                                                <MapPin className="inline w-3.5 h-3.5 mr-1.5 text-orange-400 shrink-0" />
                                                {r.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <MapContainer
                                    center={mapCenter}
                                    zoom={14}
                                    className="w-full h-[220px] rounded-xl z-0"
                                    scrollWheelZoom
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    <MapController flyTo={flyTarget} />
                                    <MapClickHandler onMapClick={handleMapClick} />
                                    <Marker
                                        position={markerPos}
                                        draggable
                                        eventHandlers={{ dragend: handleDragEnd }}
                                    />
                                </MapContainer>
                                {isReverseGeocoding && (
                                    <div className="absolute top-2 right-2 z-10 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1 text-xs text-orange-500 shadow">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Đang lấy địa chỉ...
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground">{t("checkout.mapHint")}</p>
                        </div>
                    )}

                    {/* ── Form fields ────────────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                            <Label>{t("checkout.country")}</Label>
                            <Input
                                value={form.country}
                                onChange={(e) => setField("country", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="flex items-center gap-1">
                                {t("checkout.province")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder={t("checkout.provincePlaceholder")}
                                value={form.province}
                                onChange={(e) => setField("province", e.target.value)}
                                className={errors.province ? "border-red-400 focus-visible:ring-red-400" : ""}
                            />
                            {errors.province && <p className="text-xs text-red-500">{errors.province}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="flex items-center gap-1">
                                {t("checkout.district")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder={t("checkout.districtPlaceholder")}
                                value={form.city}
                                onChange={(e) => setField("city", e.target.value)}
                                className={errors.city ? "border-red-400 focus-visible:ring-red-400" : ""}
                            />
                            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="flex items-center gap-1">
                                {t("checkout.ward")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder={t("checkout.wardPlaceholder")}
                                value={form.ward}
                                onChange={(e) => setField("ward", e.target.value)}
                                className={errors.ward ? "border-red-400 focus-visible:ring-red-400" : ""}
                            />
                            {errors.ward && <p className="text-xs text-red-500">{errors.ward}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="flex items-center gap-1">
                                {t("checkout.street")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder={t("checkout.streetPlaceholder")}
                                value={form.street}
                                onChange={(e) => setField("street", e.target.value)}
                                className={errors.street ? "border-red-400 focus-visible:ring-red-400" : ""}
                            />
                            {errors.street && <p className="text-xs text-red-500">{errors.street}</p>}
                        </div>
                    </div>

                    {/* ── Phone contacts ────────────────────────────────── */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                            {t("checkout.phoneContacts")} <span className="text-red-500">*</span>
                        </Label>
                        {form.phoneContacts.map((phone, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(i, e.target.value);
                                        setErrors((p) => ({ ...p, phoneContacts: undefined }));
                                    }}
                                    placeholder={t("checkout.phonePlaceholder")}
                                    className={`flex-1 ${errors.phoneContacts && i === 0 ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                                />
                                {form.phoneContacts.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-600 shrink-0"
                                        onClick={() => removePhone(i)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {errors.phoneContacts && (
                            <p className="text-xs text-red-500">{errors.phoneContacts}</p>
                        )}
                        {form.phoneContacts.length < 3 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 -ml-1"
                                onClick={addPhone}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                {t("checkout.addPhone")}
                            </Button>
                        )}
                    </div>

                    {/* ── Address preview ───────────────────────────────── */}
                    {preview && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-orange-600 mb-1">
                                {t("checkout.addressPreview")}
                            </p>
                            <p className="text-sm text-gray-700">{preview}</p>
                        </div>
                    )}

                    {/* ── Tuỳ chọn lưu địa chỉ (chỉ hiện khi đã đăng nhập) ── */}
                    {user && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                {/* Lưu làm mặc định */}
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="saveAsDefault"
                                        checked={saveAsDefault}
                                        onCheckedChange={(checked) => {
                                            setSaveAsDefault(!!checked);
                                        }}
                                        className="mt-0.5"
                                    />
                                    <div className="grid gap-0.5">
                                        <Label
                                            htmlFor="saveAsDefault"
                                            className="text-sm font-medium cursor-pointer leading-tight"
                                        >
                                            {t("checkout.saveAsDefault")}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {t("checkout.saveAsDefaultDesc")}
                                        </p>
                                    </div>
                                </div>

                                {/* Thêm vào danh sách */}
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="addToList"
                                        checked={addToList}
                                        onCheckedChange={(checked) => {
                                            setAddToList(!!checked);
                                        }}
                                        className="mt-0.5"
                                    />
                                    <div className="grid gap-0.5">
                                        <Label
                                            htmlFor="addToList"
                                            className="text-sm font-medium cursor-pointer leading-tight"
                                        >
                                            {t("checkout.addToAddressList")}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {t("checkout.addToAddressListDesc")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                {t("common.processing")}
                            </>
                        ) : (
                            t("common.confirm")
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
