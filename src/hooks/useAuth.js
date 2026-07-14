import { useContext } from "react";
import { AuthContext } from "../context/auth-context.js";

// Acceso de lectura/escritura al usuario logueado: { user, login, logout }.
// Uso típico: const { user, logout } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
