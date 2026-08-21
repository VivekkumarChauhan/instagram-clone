import { deleteSecureItem, getSecureItem, setSecureItem } from './mmkvStorage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function saveTokens(accessToken: string, refreshToken: string): void {
  setSecureItem(ACCESS_TOKEN_KEY, accessToken);
  setSecureItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return getSecureItem<string>(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getSecureItem<string>(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  deleteSecureItem(ACCESS_TOKEN_KEY);
  deleteSecureItem(REFRESH_TOKEN_KEY);
}

export function hasValidTokens(): boolean {
  return Boolean(getAccessToken());
}
