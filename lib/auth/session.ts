/**
 * Tiny helpers around the JWT that is already stored in localStorage
 * under `amana_token`. Nothing here talks to the server.
 *
 * The role/exp come from decoding the token payload. That is only used to
 * decide what to SHOW (e.g. hide the chat box from artisans). The backend
 * still checks the token on every request.
 */

export interface Session {
  token: string;
  userId: string;
  role: string;
}

const TOKEN_KEY = 'amana_token';
const RETURN_KEY = 'amana_return_to';
const RETURN_TTL_MS = 15 * 60 * 1000;

function decodePayload(token: string): Record<string, any> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;

    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }

  if (!token) return null;

  const payload = decodePayload(token);
  if (!payload) return null;

  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return null;
  }

  return {
    token,
    userId: String(payload.sub || ''),
    role: String(payload.role || ''),
  };
}

/* ---------------------------------------------------------
   "Take me back to where I was" after login / register.

   The artisan page saves the place here before sending a visitor to
   log in. Whatever the login or register page does afterwards, the
   global MessagingRoot sees the new session and brings them back.
--------------------------------------------------------- */

export function saveReturnTo(path: string) {
  if (!isSafePath(path)) return;

  try {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    // private mode: the ?redirect= URL parameter is still sent as well
  }
}

export function readReturnTo(): string | null {
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { path?: string; at?: number };

    if (!parsed.path || !isSafePath(parsed.path)) return null;
    if (!parsed.at || Date.now() - parsed.at > RETURN_TTL_MS) {
      sessionStorage.removeItem(RETURN_KEY);
      return null;
    }

    return parsed.path;
  } catch {
    return null;
  }
}

export function clearReturnTo() {
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // ignore
  }
}

/** Only same-site paths, never `//evil.com` or `https://...`. */
export function isSafePath(path: string) {
  return /^\/(?!\/)/.test(path) && !path.includes('\\');
}