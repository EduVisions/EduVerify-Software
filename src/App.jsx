import { Routes, Route } from 'react-router-dom'
import EduVerifyLogin from './pages/login.jsx'
import EduVerifyRegister from './pages/register.jsx'
import EduverifyStudentDashboard from './pages/page_student/main_page_student.jsx'
import EduverifyExamAccess from './pages/page_student/access_exam_student.jsx'
import EduverifyCameraCheck from './pages/page_student/camera_test_student.jsx'
import EduverifySubmitExam from './pages/page_student/submit_exam_student.jsx'
import EduverifyTeacherDashboard from './pages/page_teacher/main_page_teacher.jsx'
import EduverifyCreateExam from './pages/page_teacher/create_exam_teacher.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EduVerifyLogin />} />
      <Route path="/register" element={<EduVerifyRegister />} />
      <Route path="/student" element={<EduverifyStudentDashboard />} />
      <Route path="/student/access-exam" element={<EduverifyExamAccess />} />
      <Route path="/student/camera-check" element={<EduverifyCameraCheck />} />
      <Route path="/student/submit-exam" element={<EduverifySubmitExam />} />
      <Route path="/teacher" element={<EduverifyTeacherDashboard />} />
      <Route path="/teacher/create-exam" element={<EduverifyCreateExam />} />
    </Routes>
  )
}

export default App
