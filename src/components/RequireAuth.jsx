import { Navigate } from "react-router-dom";

export function RequireAuth({ children }) {
  const token = localStorage.getItem("quanly_token");
  return token ? children : <Navigate to="/login" replace />;
}