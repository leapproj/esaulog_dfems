export type OperatorKind = "tenant" | "ssp";

export type OperatorProfile = {
  id: string;
  username: string;
  kind: OperatorKind;
  display_name: string;
};

const TOKEN_KEY = "esaulog.operator.token";
const PROFILE_KEY = "esaulog.operator.profile";

export function getOperatorToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getOperatorProfile(): OperatorProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OperatorProfile;
  } catch {
    return null;
  }
}

export function setOperatorSession(token: string, profile: OperatorProfile) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    document.cookie = `esaulog_op=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function clearOperatorSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(PROFILE_KEY);
    document.cookie = "esaulog_op=; path=/; max-age=0; SameSite=Lax";
  } catch {
    /* ignore */
  }
}
