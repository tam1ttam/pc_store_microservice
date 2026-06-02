/**
 * Lịch sử tìm kiếm — tối đa 10 mục gần nhất.
 * Dùng để gợi ý khi user gõ lại từ khoá đã tìm trước đó.
 */

const KEY = "search_history";
const MAX_ITEMS = 10;

export const getSearchHistory = (): string[] => {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const addSearchTerm = (term: string): void => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const history = getSearchHistory().filter((t) => t !== trimmed);
    history.unshift(trimmed);
    if (history.length > MAX_ITEMS) history.splice(MAX_ITEMS);

    localStorage.setItem(KEY, JSON.stringify(history));
};

export const removeSearchTerm = (term: string): void => {
    const history = getSearchHistory().filter((t) => t !== term);
    localStorage.setItem(KEY, JSON.stringify(history));
};

export const clearSearchHistory = (): void => {
    localStorage.removeItem(KEY);
};

/**
 * Trả về gợi ý dựa trên prefix người dùng đang gõ.
 */
export const suggestSearchTerms = (prefix: string): string[] => {
    if (!prefix.trim()) return getSearchHistory();
    const lower = prefix.toLowerCase();
    return getSearchHistory().filter((t) => t.toLowerCase().startsWith(lower));
};
