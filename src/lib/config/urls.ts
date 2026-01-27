const DEFAULT_BASE_URL = 'http://localhost:3000';

function normalizeBaseUrl(rawUrl: string | undefined, fallback: string): string {
  const candidate = (rawUrl || '').trim();
  if (!candidate) {
    return fallback;
  }

  const trimmed = candidate.replace(/\/+$/, '');
  const withScheme = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withScheme).origin;
  } catch (error) {
    console.warn('[urls] Invalid base URL, falling back:', {
      rawUrl,
      fallback,
      error,
    });
    return fallback;
  }
}

export const MARKETING_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_MARKETING_URL || process.env.NEXT_PUBLIC_SITE_URL,
  DEFAULT_BASE_URL
);

export const APP_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL,
  MARKETING_URL
);

export function absoluteUrl(path: string, baseUrl: string = MARKETING_URL): string {
  return new URL(path, baseUrl).toString();
}
