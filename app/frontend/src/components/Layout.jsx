import { Navbar } from './Navbar'
import { ErrorBoundary } from './ErrorBoundary'
import { SystemMessageBanner } from './SystemMessageBanner'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SystemMessageBanner />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  )
}
