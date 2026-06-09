import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { DashboardPage } from './pages/DashboardPage'
import { EntryFormPage } from './pages/EntryFormPage'
import { TagsPage } from './pages/TagsPage'
import { ReportsPage } from './pages/ReportsPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/ToastContext'

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/dashboard', element: <Protected><DashboardPage /></Protected> },
  { path: '/entries/new', element: <Protected><EntryFormPage /></Protected> },
  { path: '/entries/:id/edit', element: <Protected><EntryFormPage /></Protected> },
  { path: '/tags', element: <Protected><TagsPage /></Protected> },
  { path: '/reports', element: <Protected><ReportsPage /></Protected> },
])

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}
