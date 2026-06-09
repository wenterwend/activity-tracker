export function TagFilterBar({ tags, selected, onChange }) {
  if (tags.length === 0) return null

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-500">Filter:</span>
      <button
        type="button"
        onClick={() => onChange([])}
        className={`rounded-full px-3 py-1 text-sm border transition-colors min-h-[36px] ${
          selected.length === 0
            ? 'bg-gray-800 text-white border-gray-800'
            : 'border-gray-300 text-gray-600 hover:border-gray-400'
        }`}
      >
        All
      </button>
      {tags.map(tag => {
        const isSelected = selected.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`rounded-full px-3 py-1 text-sm border transition-colors min-h-[36px] ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                : 'border-gray-300 text-gray-600 hover:border-indigo-400'
            }`}
          >
            {isSelected ? `✓ ${tag.name}` : tag.name}
          </button>
        )
      })}
    </div>
  )
}
