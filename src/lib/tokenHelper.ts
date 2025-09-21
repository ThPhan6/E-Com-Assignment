import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number; // unix timestamp
}

/**
 * Check if a token is valid and not expired
 * @param token - JWT token to validate
 * @returns true if token is valid and not expired, false otherwise
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    return false;
  }
};
