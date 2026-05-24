/**
 * Lưu các tuỳ chọn của user: ngôn ngữ, theme.
 * Chỉ lưu giá trị — UI chưa cần react theo.
 */

const LANG_KEY = "pref_lang";
const THEME_KEY = "pref_theme";

export type Language = "vi" | "en";
export type Theme = "light" | "dark";

// ─── Language ────────────────────────────────────────────────────────────────

export const getLanguage = (): Language => {
    return (localStorage.getItem(LANG_KEY) as Language) ?? "vi";
};

export const setLanguage = (lang: Language): void => {
    localStorage.setItem(LANG_KEY, lang);
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export const getTheme = (): Theme => {
    return (localStorage.getItem(THEME_KEY) as Theme) ?? "light";
};

export const setTheme = (theme: Theme): void => {
    localStorage.setItem(THEME_KEY, theme);
};
