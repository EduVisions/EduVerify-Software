import { useContext } from "react";
import { ExamsContext } from "../context/exams-context.js";

// Acceso a la lista de exámenes compartida: { exams, addExam, getExamById }.
// Uso típico: const { exams, getExamById } = useExams();
export function useExams() {
  const ctx = useContext(ExamsContext);
  if (!ctx) throw new Error("useExams debe usarse dentro de ExamsProvider");
  return ctx;
}
