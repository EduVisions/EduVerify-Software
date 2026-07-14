import { Routes, Route, useParams } from 'react-router-dom'
import EduVerifyLogin from './pages/login.jsx'
import EduVerifyRegister from './pages/register.jsx'
import EduverifyStudentDashboard from './pages/page_student/main_page_student.jsx'
import EduverifyExamAccess from './pages/page_student/access_exam_student.jsx'
import EduverifyCameraCheck from './pages/page_student/camera_test_student.jsx'
import EduverifyExamInProgress from './pages/page_student/exam_in_progress.jsx'
import EduverifySubmitExam from './pages/page_student/submit_exam_student.jsx'
import EduverifyTeacherDashboard from './pages/page_teacher/main_page_teacher.jsx'
import EduverifyCreateExam from './pages/page_teacher/create_exam_teacher.jsx'

// Remonta el componente por completo cuando cambia el :examId de la URL
// (navegar entre dos exámenes distintos no debe arrastrar timer/respuestas/cámara del anterior).
function KeyedByExamId({ Component }) {
  const { examId } = useParams()
  return <Component key={examId} />
}

function App() {
  return (
    <Routes>
      {/* Autenticación — no requieren sesión */}
      <Route path="/" element={<EduVerifyLogin />} />
      <Route path="/register" element={<EduVerifyRegister />} />

      {/* Dashboard del estudiante */}
      <Route path="/student" element={<EduverifyStudentDashboard />} />

      {/* Flujo de un examen puntual: camera-check → access-exam → exam-in-progress
          → submit-exam. El :examId viaja en la URL y decide qué examen se
          muestra en cada paso (nombre, código de acceso, duración...),
          leído por cada página vía useExams().getExamById(examId). */}
      <Route path="/student/camera-check/:examId" element={<KeyedByExamId Component={EduverifyCameraCheck} />} />
      <Route path="/student/access-exam/:examId" element={<KeyedByExamId Component={EduverifyExamAccess} />} />
      <Route path="/student/exam-in-progress/:examId" element={<KeyedByExamId Component={EduverifyExamInProgress} />} />
      <Route path="/student/submit-exam/:examId" element={<KeyedByExamId Component={EduverifySubmitExam} />} />

      {/* Dashboard del docente y creación de exámenes */}
      <Route path="/teacher" element={<EduverifyTeacherDashboard />} />
      <Route path="/teacher/create-exam" element={<EduverifyCreateExam />} />
    </Routes>
  )
}

export default App
