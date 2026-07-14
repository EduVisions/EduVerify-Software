import { useState } from "react";
import { ExamsContext } from "./exams-context.js";
import { EXAMS } from "../data/mockExams.js";

// Lista de exámenes como estado vivo de React (arranca con el seed de
// mockExams.js). Al ser estado y no solo un import estático, un examen que
// crea el docente queda disponible al instante en ambos dashboards y en
// todo el flujo de examen del estudiante. Se monta una sola vez en main.jsx.
// Nota: es en memoria — si recargas la página, un examen recién creado
// desaparece (no hay backend). Es el comportamiento esperado en este prototipo.
export function ExamsProvider({ children }) {
  const [exams, setExams] = useState(EXAMS);

  // Autoincrementa el id a partir del máximo actual (simula lo que haría
  // el backend al insertar una fila nueva).
  const addExam = (exam) => {
    const id = exams.reduce((max, e) => Math.max(max, e.id), 0) + 1;
    const newExam = { id, ...exam };
    setExams((prev) => [...prev, newExam]);
    return newExam;
  };

  // String(...) porque el id de la URL (useParams) siempre llega como texto,
  // mientras que el id guardado en el examen es numérico.
  const getExamById = (id) => exams.find((e) => String(e.id) === String(id));

  return (
    <ExamsContext.Provider value={{ exams, addExam, getExamById }}>
      {children}
    </ExamsContext.Provider>
  );
}
