export function TagSelector({ tags, selected, onChange }) {
  if (tags.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No tags yet — use the <strong>+ New Tag</strong> button above or visit the{' '}
        <a href="/tags" className="underline hover:text-gray-600">Tags page</a>.
      </p>
    )
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  const personal = tags.filter(t => t.type !== 'shared')
  const shared = tags.filter(t => t.type === 'shared')

  return (
    <div className="flex flex-col gap-3">
      {personal.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {personal.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                selected.includes(tag.id)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {shared.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Shared</p>
          <div className="flex flex-wrap gap-2">
            {shared.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.id)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border transition-colors ${
                  selected.includes(tag.id)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-700 border-emerald-300 hover:border-emerald-500'
                }`}
              >
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
