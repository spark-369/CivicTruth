const ACCESS_TOKEN_KEY = "access_token";

/**
 * Decode a base64url string (as used in JWT payloads) to a UTF-8 string.
 * Falls back to plain atob() when the content is not URL-encoded JSON.
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
  } catch {
    return atob(base64);
  }
}

/**
 * Safely parse the payload of a JWT without verifying its signature.
 *
 * NOTE: this is for UX/display only. The backend re-validates every request's
 * signature, authorization and expiry — never treat client-side decoded claims
 * as an authorization boundary.
 */
export function decodeToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getRoleFromToken() {
  const payload = decodeToken(getToken());
  return payload?.role || null;
}

export function getUserIdFromToken() {
  const payload = decodeToken(getToken());
  return payload?.sub || null;
}

export function getUserInfoFromToken() {
  const payload = decodeToken(getToken());
  if (!payload) return { name: "User", identifier: "" };
  return {
    name: payload.full_name || payload.name || "User",
    identifier: payload.national_id_hash?.slice(0, 16) || "",
    role: payload.role || undefined,
  };
}

export function isTokenExpired() {
  const payload = decodeToken(getToken());
  if (!payload) return true;
  return payload.exp ? Date.now() >= payload.exp * 1000 : false;
}

export function clearAuthToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}