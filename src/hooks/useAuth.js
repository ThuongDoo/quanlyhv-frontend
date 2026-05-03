import { useMemo } from "react";

const TOKEN_KEY = "quanly_token";
const USER_KEY = "quanly_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  return useMemo(() => {
    const token = getToken();
    return {
      token,
      isAuthenticated: Boolean(token),
      user: getUser(),
    };
  }, []);
}
