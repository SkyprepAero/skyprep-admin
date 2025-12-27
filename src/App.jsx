import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Chapters from './pages/Chapters'
import Questions from './pages/Questions'
import SubjectForm from './pages/SubjectForm'
import ChapterForm from './pages/ChapterForm'
import QuestionForm from './pages/QuestionForm'
import FocusOne from './pages/FocusOne'
import FocusOneEnrollForm from './pages/FocusOneEnrollForm'
import FocusOneEnrollmentDetail from './pages/FocusOneEnrollmentDetail'
import Teachers from './pages/Teachers'
import TeacherRegisterForm from './pages/TeacherRegisterForm'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/subjects" element={<Subjects />} />
                      <Route path="/subjects/new" element={<SubjectForm />} />
                      <Route path="/subjects/:id/edit" element={<SubjectForm />} />
                      <Route path="/chapters" element={<Chapters />} />
                      <Route path="/chapters/new" element={<ChapterForm />} />
                      <Route path="/chapters/:id/edit" element={<ChapterForm />} />
                      <Route path="/questions" element={<Questions />} />
                      <Route path="/questions/new" element={<QuestionForm />} />
                      <Route path="/questions/:id/edit" element={<QuestionForm />} />
                      <Route path="/focus-one" element={<FocusOne />} />
                      <Route path="/focus-one/enroll" element={<FocusOneEnrollForm />} />
                      <Route path="/focus-one/enrollments/:userId" element={<FocusOneEnrollmentDetail />} />
                      <Route path="/teachers" element={<Teachers />} />
                      <Route path="/teachers/register" element={<TeacherRegisterForm />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
