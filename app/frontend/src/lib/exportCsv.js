function escapeCsvField(value) {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export function downloadCsv(entries, start, end) {
  const headers = ['Date', 'Task Name', 'Tags', 'Time Spent (minutes)', 'Notes']
  const rows = entries.map(entry => [
    entry.date,
    entry.task_name,
    entry.tags.map(t => t.name).join('; '),
    entry.time_spent_minutes,
    entry.notes ?? '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(escapeCsvField).join(','))
    .join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `taskjournal-report-${start}-${end}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
