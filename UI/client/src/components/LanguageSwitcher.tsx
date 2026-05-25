import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi' || i18n.language?.startsWith('vi');

  const toggle = () => {
    i18n.changeLanguage(isVi ? 'en' : 'vi');
  };

  return (
    <button
      onClick={toggle}
      title={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{isVi ? 'EN' : 'VI'}</span>
    </button>
  );
}
