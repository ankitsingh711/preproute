import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CreateTestPage } from '@/pages/CreateTestPage'
import { AddQuestionsPage } from '@/pages/AddQuestionsPage'
import { PreviewPublishPage } from '@/pages/PreviewPublishPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tests/new" element={<CreateTestPage />} />
          <Route path="/tests/:id/edit" element={<CreateTestPage />} />
          <Route path="/tests/:id/questions" element={<AddQuestionsPage />} />
          <Route path="/tests/:id/preview" element={<PreviewPublishPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
