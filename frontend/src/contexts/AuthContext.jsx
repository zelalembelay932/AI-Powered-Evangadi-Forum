import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth/auth.service.js";

/**
 * Authentication Context providing user state and auth methods.
 *
 * Requirements:
 *  - <AuthProvider> must be rendered INSIDE a <BrowserRouter> (it uses useNavigate).
 *  - The JWT is issued by the backend (`/api/auth/login`) and stored in
 *    localStorage by authService. The context keeps React state in sync with it.
 *
 * What it keeps in sync automatically:
 *  - Page reload            -> session is restored from localStorage.
 *  - Expired / malformed JWT -> session is discarded (never trusted blindly).
 *  - Token reaches `exp`    -> user is signed out at that moment, no click needed.
 *  - Another tab logs in/out -> this tab follows (`storage` event).
 *  - API client gets a 401  -> this tab signs out (`auth:expired` event).
 *  - Laptop wakes from sleep -> session re-checked (timers pause while asleep).
 */
const AuthContext = createContext(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "user";

/** Event name dispatched by api.client.js when the server answers 401. */
const AUTH_EXPIRED_EVENT = "auth:expired";

/** setTimeout stores its delay in a signed 32-bit int; longer delays fire instantly. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

const EMPTY_SESSION = Object.freeze({ user: null, token: null, expiresAt: null });

/**
 * Decodes the payload of a JWT (no signature check, the server does that).
 * Used only to learn when the token expires so the UI can react to it.
 * @returns {{ valid: boolean, expiresAt: number | null }}
 *   `expiresAt` is in epoch milliseconds, or null if the token has no `exp`.
 */
function decodeToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, expiresAt: null };

    // JWTs use base64url; atob needs standard base64 with padding.
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));

    const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : null;
    return { valid: true, expiresAt };
  } catch {
    return { valid: false, expiresAt: null };
  }
}

/**
 * Builds a session object from a token + user, or EMPTY_SESSION when the token
 * is missing, malformed or already expired.
 */
function buildSession(user, token) {
  if (!user || !token) return EMPTY_SESSION;

  const { valid, expiresAt } = decodeToken(token);
  if (!valid) return EMPTY_SESSION;
  if (expiresAt !== null && expiresAt <= Date.now()) return EMPTY_SESSION;

  return { user, token, expiresAt };
}

/**
 * Reads localStorage and returns the current valid session.
 * Side effect: wipes storage if it holds a session that is no longer valid, so
 * the axios interceptor never sends a dead token.
 */
function readStoredSession() {
  const token = authService.getStoredToken();
  const user = authService.getStoredUser();
  const session = buildSession(user, token);

  const hadStoredData = Boolean(token || localStorage.getItem(USER_KEY));
  if (session === EMPTY_SESSION && hadStoredData) {
    authService.logout();
  }

  return session;
}

/**
 * AuthProvider component that wraps the app to provide authentication context.
 */
export function AuthProvider({ children }) {
  // Restore the session synchronously from localStorage on the first render, so
  // there is no logged-out flash and no extra render pass on page reload.
  const [session, setSession] = useState(readStoredSession);
  const navigate = useNavigate();

  // `loading` means "restoring the session". Restore is synchronous (it only
  // reads localStorage), so it is always false. It stays in the context API so
  // ProtectedRoute keeps its loader; if you later verify the token with a
  // server call (e.g. GET /api/auth/me), drive this flag from that request.
  // login/register intentionally do NOT affect it, otherwise ProtectedRoute
  // would flash "Checking your session…" during a sign-in.
  const loading = false;

  /**
   * Re-reads localStorage and updates state only if the session really changed
   * (same token => same object => no re-render).
   */
  const syncSession = useCallback(() => {
    const next = readStoredSession();
    setSession((prev) => (prev.token === next.token ? prev : next));
  }, []);

  // Keep this tab in sync with the outside world.
  useEffect(() => {
    const onStorage = (event) => {
      // event.key is null when localStorage.clear() is called in another tab.
      if (event.key === null || event.key === TOKEN_KEY || event.key === USER_KEY) {
        syncSession();
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") syncSession();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_EXPIRED_EVENT, syncSession);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_EXPIRED_EVENT, syncSession);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [syncSession]);

  // Sign the user out the moment the token expires.
  // syncSession() is the timer callback: if the delay was clamped it simply
  // finds the session still valid and nothing changes, then the effect re-arms.
  useEffect(() => {
    if (!session.expiresAt) return undefined;

    const delay = Math.max(session.expiresAt - Date.now(), 0);
    const timerId = setTimeout(syncSession, Math.min(delay, MAX_TIMEOUT_MS));

    return () => clearTimeout(timerId);
  }, [session.expiresAt, session.token, syncSession]);

  /**
   * Registers a new user. Does not automatically log them in.
   * @param {Object} userData - { firstName, lastName, email, password }
   * @returns {Promise<{ success: true, user: Object }>}
   * @throws {Error} Friendly message from authService (shown by the Auth page).
   */
  const register = useCallback(async (userData) => {
    const { user } = await authService.register(userData);
    return { success: true, user };
  }, []);

  /**
   * Authenticates a user and updates the session state.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ success: true }>}
   * @throws {Error} Friendly message from authService (shown by the Auth page).
   */
  const login = useCallback(async (credentials) => {
    const { user, token } = await authService.login(credentials);
    setSession(buildSession(user, token));
    return { success: true };
  }, []);

  /**
   * Clears the user session and redirects to the login page.
   */
  const logout = useCallback(() => {
    authService.logout();
    // Clear the session and navigate in ONE transition so they commit together.
    // Otherwise ProtectedRoute sees "logged out" a render earlier than the new
    // location and redirects with `from: <page just left>`, which would send the
    // user straight back to that page after their next sign-in.
    startTransition(() => {
      setSession(EMPTY_SESSION);
      navigate("/auth", { replace: true, state: null });
    });
  }, [navigate]);

  // Memoised so consumers only re-render when something they read changed.
  const value = useMemo(
    () => ({
      user: session.user,
      loading,
      register,
      login,
      logout,
      isAuthenticated: session.user !== null,
    }),
    [session.user, loading, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access the authentication context.
 * @throws {Error} If used outside of AuthProvider
 */
// Provider and hook live together by design; consumers import both from here.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}