import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import styles from "./ProtectedRoute.module.css";

/**
 * Guards protected pages and redirects unauthenticated users to the login page,
 * preserving the original URL (path, query string and hash) for post-login
 * redirection via `location.state.from`.
 *
 * Works in both React Router styles:
 *
 *   // 1. Wrapping a single page
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *
 *   // 2. Guarding a group of routes (layout route)
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<Layout />}>
 *       <Route path="/dashboard" element={<Dashboard />} />
 *       <Route path="/my-questions" element={<MyQuestions />} />
 *     </Route>
 *   </Route>
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Session restore: show a neutral full-page loader (no route flash).
  if (loading) {
    return (
      <div
        className={styles.protectedRoute__screen}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className={styles.protectedRoute__spinner} aria-hidden="true" />
        <span>Checking your session…</span>
      </div>
    );
  }

  // Redirect to /auth if not authenticated, preserving the original URL.
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated: render the wrapped page, or the nested routes for layout use.
  return children ?? <Outlet />;
}