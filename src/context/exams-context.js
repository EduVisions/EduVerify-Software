import { createContext } from "react";

// Igual que auth-context.js: separado en su propio archivo para que
// ExamsContext.jsx (Provider) y hooks/useExams.js (hook) compartan un único
// Context sin mezclar exports de componente + no-componente en un archivo.
export const ExamsContext = createContext(null);
