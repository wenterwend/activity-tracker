export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="flex gap-1 mt-1">
        <div className="h-4 bg-gray-100 rounded-full w-12" />
        <div className="h-4 bg-gray-100 rounded-full w-16" />
      </div>
    </div>
  )
}
