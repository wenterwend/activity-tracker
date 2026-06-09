function formatTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export async function downloadPdf(entries, start, end) {
  // Dynamic imports keep jsPDF out of the main bundle — only loaded on demand
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFontSize(14)
  doc.text(`TaskJournal Report — ${start} to ${end}`, 14, 16)

  const totalMinutes = entries.reduce((sum, e) => sum + e.time_spent_minutes, 0)

  autoTable(doc, {
    startY: 22,
    head: [['Date', 'Task Name', 'Tags', 'Time Spent', 'Notes']],
    body: entries.map(entry => [
      entry.date,
      entry.task_name,
      entry.tags.map(t => t.name).join(', '),
      formatTime(entry.time_spent_minutes),
      entry.notes ?? '',
    ]),
    foot: [[
      {
        content: `Total: ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · ${formatTime(totalMinutes)}`,
        colSpan: 5,
        styles: { fontStyle: 'bold' },
      },
    ]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 60 },
      2: { cellWidth: 40 },
      3: { cellWidth: 22 },
      4: { cellWidth: 'auto' },
    },
    didDrawPage: (data) => {
      doc.setFontSize(8)
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 8
      )
    },
  })

  doc.save(`taskjournal-report-${start}-${end}.pdf`)
}
