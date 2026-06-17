import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  isActive
    ? 'text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-1'
    : 'text-sm text-gray-500 hover:text-gray-800 pb-1 transition-colors'

export function AdminNav() {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-6 max-w-4xl">
        <NavLink to="/admin" end className={linkClass}>Overview</NavLink>
        <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
        <NavLink to="/admin/system-message" className={linkClass}>System Message</NavLink>
        <NavLink to="/admin/audit-log" className={linkClass}>Audit Log</NavLink>
        <NavLink to="/admin/tags" className={linkClass}>Tag Cleanup</NavLink>
      </nav>
    </div>
  )
}
