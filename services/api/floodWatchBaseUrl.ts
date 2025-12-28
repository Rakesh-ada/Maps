import { Platform } from 'react-native';

export function getFloodWatchBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_FLOODWATCH_BASE_URL;
  if (raw && raw.trim().length > 0) {
    return raw.replace(/\/$/, '');
  }

  const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  return `http://${host}:8000`;
}

export function floodWatchUrl(pathname: string): string {
  const base = getFloodWatchBaseUrl();
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
