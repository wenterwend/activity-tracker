import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../../lib/api'
import { AdminNav } from '../../components/AdminNav'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toggling, setToggling] = useState(null)

  useEffect(() => { document.title = 'Admin — Users' }, [])

  const fetchUsers = useCallback((q = '') => {
    setLoading(true)
    apiFetch(`/admin/users${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  function handleSearch(e) {
    e.preventDefault()
    fetchUsers(search)
  }

  async function toggleStatus(user) {
    setToggling(user.id)
    try {
      await apiFetch(`/admin/users/${user.id}/status`, {
        method: 'PUT',
        body: { is_active: !user.is_active },
      })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
      <AdminNav />

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email…"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">Error: {error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Entries</th>
                <th className="py-2 pr-4">Tags</th>
                <th className="py-2 pr-4">Last active</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">
                    {user.email ?? <span className="text-gray-400 italic">unknown</span>}
                    {user.is_admin && (
                      <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">admin</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{user.entry_count}</td>
                  <td className="py-3 pr-4 text-gray-600">{user.tag_count}</td>
                  <td className="py-3 pr-4 text-gray-500">{formatDate(user.last_active_at)}</td>
                  <td className="py-3 pr-4 text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleStatus(user)}
                      disabled={toggling === user.id}
                      className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                        user.is_active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      } disabled:opacity-50`}
                    >
                      {toggling === user.id ? '…' : user.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
