import { useState, useRef } from "react";
import { AlertTriangle, CheckCircle, Plus, Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks";
import { setProfileActive } from "@/redux/slices/user";
import { userApi, type AddressRequest } from "@/services/api/userApi";
import type { AddressFormData } from "@/components/AddressDialog";

interface AddressForm {
    country: string;
    province: string;
    city: string;
    ward: string;
    street: string;
    isDefault: boolean;
    phoneContacts: string[];
}

const emptyAddress = (): AddressForm => ({
    country: "Việt Nam",
    province: "",
    city: "",
    ward: "",
    street: "",
    isDefault: false,
    phoneContacts: [],
});

interface Props {
    onClose?: () => void;
    /** Địa chỉ đã chọn ở trang Checkout — tự động điền vào form địa chỉ */
    prefillAddress?: AddressFormData | null;
}

export default function ProfileCompletionModal({ onClose, prefillAddress }: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [step, setStep] = useState<"profile" | "otp">("profile");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [otpCode, setOtpCode] = useState("");
    const [otpError, setOtpError] = useState("");
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const bodyRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dob: "",
        gender: "",
    });

    const [addresses, setAddresses] = useState<AddressForm[]>(() => {
        // Nếu người dùng đã chọn địa chỉ ở Checkout → điền sẵn vào form
        if (prefillAddress && (prefillAddress.province || prefillAddress.street)) {
            return [{
                country:      prefillAddress.country  || "Việt Nam",
                province:     prefillAddress.province || "",
                city:         prefillAddress.city     || "",
                ward:         prefillAddress.ward     || "",
                street:       prefillAddress.street   || "",
                isDefault:    true,
                phoneContacts: prefillAddress.phoneContacts.filter(Boolean),
            }];
        }
        return [{ ...emptyAddress(), isDefault: true }];
    });

    const setField = (key: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: "" }));
    };

    const setAddressField = (index: number, key: keyof AddressForm, value: string | boolean) => {
        setAddresses(prev => prev.map((a, i) => i === index ? { ...a, [key]: value } : a));
        setErrors(prev => ({ ...prev, [`addr_${index}_${key}`]: "" }));
    };

    const addAddress = () => {
        setAddresses(prev => [...prev, emptyAddress()]);
    };

    const removeAddress = (index: number) => {
        if (addresses.length === 1) return;
        setAddresses(prev => {
            const next = prev.filter((_, i) => i !== index);
            if (!next.some(a => a.isDefault)) next[0].isDefault = true;
            return next;
        });
    };

    const setDefaultAddress = (index: number) => {
        setAddresses(prev => prev.map((a, i) => ({ ...a, isDefault: i === index })));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.firstName.trim()) errs.firstName = t('profile.firstNameRequired');
        if (!form.lastName.trim()) errs.lastName = t('profile.lastNameRequired');
        if (!form.email.trim()) errs.email = t('profile.emailRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('profile.emailInvalid');
        if (!form.phoneNumber.trim()) errs.phoneNumber = t('profile.phoneRequired');
        else if (!/^0[0-9]{9}$/.test(form.phoneNumber)) errs.phoneNumber = t('profile.phoneInvalid');

        addresses.forEach((addr, i) => {
            if (!addr.province.trim()) errs[`addr_${i}_province`] = t('profile.provinceRequired');
            if (!addr.city.trim()) errs[`addr_${i}_city`] = t('profile.districtRequired');
            if (!addr.ward.trim()) errs[`addr_${i}_ward`] = t('profile.wardRequired');
            if (!addr.street.trim()) errs[`addr_${i}_street`] = t('profile.streetRequired');
        });

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            // Scroll về đầu để user thấy lỗi trên các field thông tin cá nhân
            bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        setLoading(true);
        try {
            await userApi.completeProfile({
                ...form,
                addresses: addresses as AddressRequest[],
            });
            setStep("otp");
        } catch {
            toast({ title: t('profile.completeFailed2') });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = () => {
        if (!otpCode.trim()) {
            setOtpError(t('profile.otpRequired'));
            return;
        }
        dispatch(setProfileActive());
        toast({ title: t('profile.verifySuccess') });
        onClose?.();
    };

    // ── Exit confirmation ──────────────────────────────────────────────────────
    const handleCloseAttempt = () => setShowExitConfirm(true);
    const handleConfirmExit = () => { setShowExitConfirm(false); onClose?.(); };
    const handleCancelExit  = () => setShowExitConfirm(false);

    // ── Exit confirm overlay ───────────────────────────────────────────────────
    const ExitConfirmDialog = () => (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-2xl">
            <div className="bg-white rounded-xl p-6 mx-6 shadow-xl max-w-sm w-full text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2">
                    {t('profile.exitConfirmTitle')}
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                    {t('profile.exitConfirmDesc')}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={handleCancelExit}
                        className="flex-1 border border-orange-500 text-orange-500 font-semibold py-2.5 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                    >
                        {t('profile.stayBtn')}
                    </button>
                    <button
                        onClick={handleConfirmExit}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                    >
                        {t('profile.exitConfirmBtn')}
                    </button>
                </div>
            </div>
        </div>
    );

    // ── OTP step ───────────────────────────────────────────────────────────────
    if (step === "otp") {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('profile.otpVerifyTitle')}</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        {t('profile.otpSentDesc')}
                    </p>
                    <input
                        type="text"
                        placeholder={t('profile.otpPlaceholder')}
                        value={otpCode}
                        onChange={e => { setOtpCode(e.target.value); setOtpError(""); }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-lg tracking-widest mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        maxLength={6}
                    />
                    {otpError && <p className="text-red-500 text-xs mb-3">{otpError}</p>}
                    <button
                        onClick={handleVerifyOtp}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
                    >
                        {t('profile.verify')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] relative">

                {/* Exit confirm overlay (sits on top of the modal card) */}
                {showExitConfirm && <ExitConfirmDialog />}

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{t('profile.complete')}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('profile.subtitle')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCloseAttempt}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors mt-0.5 ml-4 shrink-0"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div ref={bodyRef} className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
                    {/* Personal info */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                            {t('profile.personalInfo')}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label={`${t('auth.firstName')} *`} error={errors.firstName}>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={e => setField("firstName", e.target.value)}
                                    placeholder="Nguyễn"
                                    className={inputCls(errors.firstName)}
                                />
                            </Field>
                            <Field label={`${t('auth.lastName')} *`} error={errors.lastName}>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={e => setField("lastName", e.target.value)}
                                    placeholder="Văn A"
                                    className={inputCls(errors.lastName)}
                                />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 gap-3 mt-3">
                            <Field label={`${t('auth.emailLabel')} *`} error={errors.email}>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setField("email", e.target.value)}
                                    placeholder="example@email.com"
                                    className={inputCls(errors.email)}
                                />
                            </Field>
                            <Field label={`${t('auth.phoneLabel')} *`} error={errors.phoneNumber}>
                                <input
                                    type="tel"
                                    value={form.phoneNumber}
                                    onChange={e => setField("phoneNumber", e.target.value)}
                                    placeholder="0xxxxxxxxx"
                                    className={inputCls(errors.phoneNumber)}
                                />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <Field label={t('profile.dob')}>
                                <input
                                    type="date"
                                    value={form.dob}
                                    onChange={e => setField("dob", e.target.value)}
                                    className={inputCls()}
                                />
                            </Field>
                            <Field label={t('profile.gender')}>
                                <select
                                    value={form.gender}
                                    onChange={e => setField("gender", e.target.value)}
                                    className={inputCls()}
                                >
                                    <option value="">-- {t('common.filter')} --</option>
                                    <option value="Nam">{t('profile.male')}</option>
                                    <option value="Nữ">{t('profile.female')}</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </Field>
                        </div>
                    </section>

                    {/* Addresses */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                {t('profile.shippingAddresses')}
                            </h3>
                            <button
                                type="button"
                                onClick={addAddress}
                                className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium"
                            >
                                <Plus className="w-4 h-4" /> {t('profile.addAddress')}
                            </button>
                        </div>

                        {addresses.map((addr, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-xl p-4 mb-3 relative">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">{t('profile.addressLabel', { num: idx + 1 })}</span>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={addr.isDefault}
                                                onChange={() => setDefaultAddress(idx)}
                                                className="accent-orange-500"
                                            />
                                            {t('profile.defaultAddress')}
                                        </label>
                                        {addresses.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAddress(idx)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Field label={`${t('profile.province')} *`} error={errors[`addr_${idx}_province`]}>
                                        <input
                                            type="text"
                                            value={addr.province}
                                            onChange={e => setAddressField(idx, "province", e.target.value)}
                                            placeholder="Hà Nội"
                                            className={inputCls(errors[`addr_${idx}_province`])}
                                        />
                                    </Field>
                                    <Field label={`${t('profile.district')} *`} error={errors[`addr_${idx}_city`]}>
                                        <input
                                            type="text"
                                            value={addr.city}
                                            onChange={e => setAddressField(idx, "city", e.target.value)}
                                            placeholder="Cầu Giấy"
                                            className={inputCls(errors[`addr_${idx}_city`])}
                                        />
                                    </Field>
                                    <Field label={`${t('profile.ward')} *`} error={errors[`addr_${idx}_ward`]}>
                                        <input
                                            type="text"
                                            value={addr.ward}
                                            onChange={e => setAddressField(idx, "ward", e.target.value)}
                                            placeholder="Dịch Vọng Hậu"
                                            className={inputCls(errors[`addr_${idx}_ward`])}
                                        />
                                    </Field>
                                    <Field label={t('profile.country')}>
                                        <input
                                            type="text"
                                            value={addr.country}
                                            onChange={e => setAddressField(idx, "country", e.target.value)}
                                            className={inputCls()}
                                        />
                                    </Field>
                                </div>
                                <div className="mt-2">
                                    <Field label={`${t('profile.street')} *`} error={errors[`addr_${idx}_street`]}>
                                        <input
                                            type="text"
                                            value={addr.street}
                                            onChange={e => setAddressField(idx, "street", e.target.value)}
                                            placeholder="123 Đường Xuân Thuỷ"
                                            className={inputCls(errors[`addr_${idx}_street`])}
                                        />
                                    </Field>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t('profile.complete')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
        </div>
    );
}

function inputCls(error?: string) {
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
        error
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-300 focus:ring-orange-300 focus:border-orange-400"
    }`;
}
