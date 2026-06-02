import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const isVi = i18n.language === 'vi' || i18n.language?.startsWith('vi');

  const toggle = () => {
    // Chuyển sang ngôn ngữ kia
    i18n.changeLanguage(isVi ? 'en' : 'vi');
  };

  return (
    <button
      onClick={toggle}
      // title gợi ý ngôn ngữ SẼ chuyển sang
      title={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
    >
      <Globe className="w-3.5 h-3.5" />
      {/* Hiển thị ngôn ngữ HIỆN TẠI — t('lang.current') trả về "VI" hoặc "EN" */}
      <span>{t('lang.current')}</span>
    </button>
  );
}
