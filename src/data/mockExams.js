// Datos mock de exámenes — fuente única compartida entre las vistas de
// estudiante y docente (antes vivían duplicados en cada dashboard y en
// cada pantalla del flujo de examen).

// estado: "programado" | "en_curso" | "finalizado" — un solo campo canónico.
// Cada dashboard lo traduce a su propia etiqueta:
//   estudiante: en_curso -> "disponible", programado -> "proximo", finalizado -> "finalizado"
//   docente: usa el valor directo
export const EXAMS = [
  {
    id: 1,
    nombre: "Cálculo Diferencial - Parcial 2",
    curso: "Matemática II",
    docente: "Dr. Roberto Salas",
    fecha: "2026-06-21",
    hora: "09:00",
    duracion: 90,
    estado: "en_curso",
    nota: null,
    inscritos: 32,
    conectados: 29,
    alertas: 4,
    codigoAcceso: "MATH2026",
  },
  {
    id: 2,
    nombre: "Estructuras de Datos - Final",
    curso: "Programación III",
    docente: "Ing. Lucía Fernández",
    fecha: "2026-06-25",
    hora: "14:30",
    duracion: 120,
    estado: "programado",
    nota: null,
    inscritos: 28,
    conectados: 0,
    alertas: 0,
    codigoAcceso: "DATA2026",
  },
  {
    id: 3,
    nombre: "Bases de Datos - Quiz 3",
    curso: "Bases de Datos",
    docente: "Mg. Pedro Ramírez",
    fecha: "2026-06-28",
    hora: "11:00",
    duracion: 45,
    estado: "programado",
    nota: null,
    inscritos: 25,
    conectados: 0,
    alertas: 0,
    codigoAcceso: "BD2026Q3",
  },
  {
    id: 4,
    nombre: "Física General - Parcial 1",
    curso: "Física I",
    docente: "Dr. Andrés Castillo",
    fecha: "2026-06-10",
    hora: "10:00",
    duracion: 90,
    estado: "finalizado",
    nota: 17,
    inscritos: 30,
    conectados: 30,
    alertas: 7,
    codigoAcceso: "FIS2026P1",
  },
  {
    id: 5,
    nombre: "Inglés Técnico - Evaluación 2",
    curso: "Inglés Técnico",
    docente: "Lic. Carmen Díaz",
    fecha: "2026-06-05",
    hora: "16:00",
    duracion: 60,
    estado: "finalizado",
    nota: 19,
    inscritos: 22,
    conectados: 22,
    alertas: 0,
    codigoAcceso: "ENG2026",
  },
  {
    id: 6,
    nombre: "Álgebra Lineal - Quiz 1",
    curso: "Matemática I",
    docente: "Mg. Sofía Herrera",
    fecha: "2026-06-02",
    hora: "08:00",
    duracion: 40,
    estado: "finalizado",
    nota: 15,
    inscritos: 35,
    conectados: 33,
    alertas: 2,
    codigoAcceso: "ALG2026",
  },
];

// Traduce el estado canónico del examen a lo que ve el estudiante:
// etiqueta, color e ícono, más un `key` corto que usan los filtros
// ("Disponibles" / "Próximos" / "Finalizados") en el dashboard.
export const STUDENT_STATUS_META = {
  en_curso: { key: "disponible", label: "Disponible ahora", color: "#22b865", bg: "#eafff3" },
  programado: { key: "proximo", label: "Próximo", color: "#4f7cff", bg: "#f0f4ff" },
  finalizado: { key: "finalizado", label: "Finalizado", color: "#8c92a4", bg: "#f3f4f7" },
};

// Igual que STUDENT_STATUS_META pero para el dashboard del docente,
// que sí usa el estado tal cual (no necesita el `key` alterno).
export const TEACHER_STATUS_META = {
  programado: { label: "Programado", color: "#4f7cff", bg: "#f0f4ff" },
  en_curso: { label: "En curso", color: "#22b865", bg: "#eafff3" },
  finalizado: { label: "Finalizado", color: "#8c92a4", bg: "#f3f4f7" },
};

// Banco de preguntas compartido por todos los exámenes (HU no pide contenido
// distinto por examen, solo eliminar la duplicación de datos).
export const QUESTION_BANK = [
  {
    id: 1,
    pregunta: "¿Cuál es la derivada de f(x) = 3x² + 5x − 7?",
    tipo: "opcion_multiple",
    opciones: [
      "f'(x) = 6x + 5",
      "f'(x) = 3x + 5",
      "f'(x) = 6x − 7",
      "f'(x) = 6x² + 5",
    ],
  },
  {
    id: 2,
    pregunta: "Si f(x) = sen(x) · cos(x), ¿cuál es f'(x)?",
    tipo: "opcion_multiple",
    opciones: [
      "f'(x) = cos²(x) − sen²(x)",
      "f'(x) = −sen²(x)",
      "f'(x) = cos(x) − sen(x)",
      "f'(x) = 2sen(x)cos(x)",
    ],
  },
  {
    id: 3,
    pregunta: "¿En qué punto la función f(x) = x³ − 3x tiene un mínimo local?",
    tipo: "opcion_multiple",
    opciones: ["x = −1", "x = 1", "x = 0", "x = 3"],
  },
  {
    id: 4,
    pregunta: "Calcula el límite: lim(x→0) [sen(x)/x]",
    tipo: "opcion_multiple",
    opciones: ["0", "∞", "1", "No existe"],
  },
  {
    id: 5,
    pregunta: "La función f(x) = e^x es derivable en todo su dominio. Esto se debe a que:",
    tipo: "opcion_multiple",
    opciones: [
      "Es una función polinómica continua",
      "Es su propia derivada, lo que la hace suave y sin discontinuidades",
      "Su derivada siempre es cero",
      "Solo es derivable en x = 0",
    ],
  },
  {
    id: 6,
    pregunta: "Explica con tus propias palabras el concepto de derivada y su interpretación geométrica.",
    tipo: "texto_libre",
  },
  {
    id: 7,
    pregunta: "¿Cuál de las siguientes reglas se usa para derivar un producto de funciones?",
    tipo: "opcion_multiple",
    opciones: [
      "Regla de la cadena",
      "Regla del cociente",
      "Regla del producto",
      "Regla de la suma",
    ],
  },
  {
    id: 8,
    pregunta: "Si g(x) = ln(x²), ¿cuánto vale g'(x)?",
    tipo: "opcion_multiple",
    opciones: ["2/x", "1/x²", "2x", "ln(2x)"],
  },
  {
    id: 9,
    pregunta: "Una empresa modela sus ganancias con G(t) = −2t² + 40t − 100. ¿En qué momento t maximiza sus ganancias?",
    tipo: "opcion_multiple",
    opciones: ["t = 5", "t = 10", "t = 20", "t = 40"],
  },
  {
    id: 10,
    pregunta: "¿Cuál es la derivada de f(x) = arctan(x)?",
    tipo: "opcion_multiple",
    opciones: [
      "1 / (1 + x²)",
      "1 / √(1 − x²)",
      "−1 / (1 + x²)",
      "tan(x)",
    ],
  },
];
