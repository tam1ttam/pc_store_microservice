import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
}

export const isTokenValid = (token: string): boolean => {
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch {
    return false;
  }
}