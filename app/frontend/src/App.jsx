import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { DashboardPage } from './pages/DashboardPage'
import { EntryFormPage } from './pages/EntryFormPage'
import { TagsPage } from './pages/TagsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminSystemMessage } from './pages/admin/AdminSystemMessage'
import { AdminAuditLog } from './pages/admin/AdminAuditLog'
import { AdminTagCleanup } from './pages/admin/AdminTagCleanup'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AdminProvider } from './components/AdminContext'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/ToastContext'

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AdminProvider>
        <Layout>{children}</Layout>
      </AdminProvider>
    </ProtectedRoute>
  )
}

function Admin({ children }) {
  return (
    <Protected>
      <AdminRoute>{children}</AdminRoute>
    </Protected>
  )
}

const router = createBrowserRouter([
  { path: '/',                    element: <Navigate to="/dashboard" replace /> },
  { path: '/login',               element: <LoginPage /> },
  { path: '/signup',              element: <SignupPage /> },
  { path: '/auth/callback',       element: <AuthCallbackPage /> },
  { path: '/dashboard',           element: <Protected><DashboardPage /></Protected> },
  { path: '/entries/new',         element: <Protected><EntryFormPage /></Protected> },
  { path: '/entries/:id/edit',    element: <Protected><EntryFormPage /></Protected> },
  { path: '/tags',                element: <Protected><TagsPage /></Protected> },
  { path: '/reports',             element: <Protected><ReportsPage /></Protected> },
  { path: '/settings',            element: <Protected><SettingsPage /></Protected> },
  { path: '/admin',               element: <Admin><AdminDashboard /></Admin> },
  { path: '/admin/users',         element: <Admin><AdminUsers /></Admin> },
  { path: '/admin/system-message',element: <Admin><AdminSystemMessage /></Admin> },
  { path: '/admin/audit-log',     element: <Admin><AdminAuditLog /></Admin> },
  { path: '/admin/tags',          element: <Admin><AdminTagCleanup /></Admin> },
])

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}
