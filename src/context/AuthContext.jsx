import { useState } from "react";
import { AuthContext } from "./auth-context.js";

// Guarda quién inició sesión (nombre, rol, institución...) para que todas las
// pantallas lean el mismo usuario en vez de cada una hardcodear el suyo.
// Se monta una sola vez en main.jsx, envolviendo <App/>. Solo vive en
// memoria: no hay rutas protegidas, así que un refresh no debe dejarte
// afuera a mitad de examen (ver hooks/useAuth.js para el hook de consumo).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = nadie ha iniciado sesión

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
