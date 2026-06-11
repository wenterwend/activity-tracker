// states: { [tagId]: 'include' | 'exclude' }
// Clicking cycles: unselected → include → exclude → unselected
export function TagFilterBar({ tags, states = {}, onChange }) {
  if (tags.length === 0) return null

  function cycle(id) {
    const current = states[id]
    const next = !current ? 'include' : current === 'include' ? 'exclude' : null
    const updated = { ...states }
    if (next === null) {
      delete updated[id]
    } else {
      updated[id] = next
    }
    onChange(updated)
  }

  const hasAny = Object.keys(states).length > 0

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-500">Filter:</span>
      <button
        type="button"
        onClick={() => onChange({})}
        className={`rounded-full px-3 py-1 text-sm border transition-colors min-h-[36px] ${
          !hasAny
            ? 'bg-gray-800 text-white border-gray-800'
            : 'border-gray-300 text-gray-600 hover:border-gray-400'
        }`}
      >
        All
      </button>
      {tags.map(tag => {
        const state = states[tag.id]
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => cycle(tag.id)}
            title={!state ? 'Click to include' : state === 'include' ? 'Click to exclude' : 'Click to clear'}
            className={`rounded-full px-3 py-1 text-sm border transition-colors min-h-[36px] font-medium ${
              state === 'include'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : state === 'exclude'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'border-gray-300 text-gray-600 hover:border-indigo-400 font-normal'
            }`}
          >
            {state === 'include' && <span className="mr-1">✓</span>}
            {state === 'exclude' && <span className="mr-1">✗</span>}
            <span className={state === 'exclude' ? 'line-through' : ''}>{tag.name}</span>
          </button>
        )
      })}
      {hasAny && (
        <span className="text-xs text-gray-400 italic">
          {[
            Object.values(states).filter(s => s === 'include').length > 0 && 'green = include',
            Object.values(states).filter(s => s === 'exclude').length > 0 && 'red = exclude',
          ].filter(Boolean).join(' · ')}
        </span>
      )}
    </div>
  )
}
