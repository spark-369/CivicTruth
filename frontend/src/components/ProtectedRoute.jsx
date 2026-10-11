import { Navigate } from "react-router-dom";
import { decodeToken, getToken, clearAuthToken } from "../utils/auth";

export function ProtectedRoute({ children, allowedRoles }) {
  const token = getToken();
  const payload = token ? decodeToken(token) : null;

  // No token or malformed token -> login.
  if (!payload) {
    clearAuthToken();
    return <Navigate to="/login" replace />;
  }

  // Expired token -> login.
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    clearAuthToken();
    return <Navigate to="/login" replace />;
  }

  // Role-based access. Authorization is enforced server-side as well; this
  // only gates the client UI.
  if (allowedRoles && payload.role && !allowedRoles.includes(payload.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}