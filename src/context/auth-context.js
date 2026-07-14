import { createContext } from "react";

// Solo el objeto de contexto vive aquí (sin componentes ni hooks) para que
// Fast Refresh no se queje: AuthContext.jsx exporta el Provider y
// hooks/useAuth.js exporta el hook, ambos importan este mismo Context.
export const AuthContext = createContext(null);
