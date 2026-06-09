import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function truncateEmail(email) {
  if (!email) return ''
  return email.length > 24 ? email.slice(0, 24) + '…' : email
}

const desktopLinkClass = ({ isActive }) =>
  isActive
    ? 'font-semibold text-indigo-600'
    : 'text-gray-600 hover:text-gray-900 transition-colors'

export function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    setMobileOpen(false)
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="font-bold text-indigo-600 text-lg">
          TaskJournal
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <NavLink to="/dashboard" className={desktopLinkClass}>Dashboard</NavLink>
          <NavLink to="/reports" className={desktopLinkClass}>Reports</NavLink>
          <NavLink to="/tags" className={desktopLinkClass}>Tags</NavLink>
          <span className="text-gray-400 text-sm">{truncateEmail(user?.email)}</span>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setMobileOpen(o => !o)}
          className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 px-4 pb-3 pt-2 flex flex-col gap-1 text-sm">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="py-2.5 text-gray-700 font-medium min-h-[44px] flex items-center"
          >
            Dashboard
          </Link>
          <Link
            to="/reports"
            onClick={() => setMobileOpen(false)}
            className="py-2.5 text-gray-700 font-medium min-h-[44px] flex items-center"
          >
            Reports
          </Link>
          <Link
            to="/tags"
            onClick={() => setMobileOpen(false)}
            className="py-2.5 text-gray-700 font-medium min-h-[44px] flex items-center"
          >
            Tags
          </Link>
          <p className="text-gray-400 text-xs pt-1 pb-1">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="text-left py-2.5 text-red-600 font-medium min-h-[44px] flex items-center"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  )
}
