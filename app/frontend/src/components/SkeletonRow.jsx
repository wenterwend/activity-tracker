export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 bg-gray-200 rounded" style={{ width: i === 1 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  )
}
