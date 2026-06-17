export function TagBadge({ name, type = 'personal' }) {
  return type === 'shared' ? (
    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">
      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {name}
    </span>
  ) : (
    <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 text-xs font-medium">
      {name}
    </span>
  )
}
