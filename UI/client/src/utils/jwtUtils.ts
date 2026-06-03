export function decodeJwtSub(token: string): string | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.sub ?? null;
    } catch {
        return null;
    }
}
