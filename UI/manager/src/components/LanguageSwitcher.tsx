import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const isVi = i18n.language === 'vi' || i18n.language?.startsWith('vi');

  const toggle = () => {
    i18n.changeLanguage(isVi ? 'en' : 'vi');
  };

  return (
    <button
      onClick={toggle}
      title={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
    >
      <Globe className="w-4 h-4" />
      <span>{t('lang.current', { defaultValue: isVi ? 'VI' : 'EN' })}</span>
    </button>
  );
}
