export function TagSelector({ tags, selected, onChange }) {
  if (tags.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No tags yet —{' '}
        <a href="/tags" className="underline hover:text-gray-600">
          create some on the Tags page
        </a>
        .
      </p>
    )
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
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
  )
}
