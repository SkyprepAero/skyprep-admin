import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Chapters from './pages/Chapters'
import Questions from './pages/Questions'
import SubjectForm from './pages/SubjectForm'
import ChapterForm from './pages/ChapterForm'
import QuestionForm from './pages/QuestionForm'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
