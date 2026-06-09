import { useState } from 'react'
import { TagSelector } from './TagSelector'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function minutesToDisplay(minutes, unit) {
  if (unit === 'hours') return (minutes / 60).toFixed(2).replace(/\.?0+$/, '')
  return String(minutes)
}

export function EntryForm({ initialValues, tags = [], onSubmit, submitLabel = 'Save Entry' }) {
  const defaultUnit = initialValues?.time_spent_minutes > 0 && initialValues.time_spent_minutes % 60 === 0
    ? 'hours'
    : initialValues?.time_spent_minutes
      ? 'minutes'
      : 'hours'

  const [taskName, setTaskName] = useState(initialValues?.task_name ?? '')
  const [date, setDate] = useState(initialValues?.date ?? today())
  const [timeUnit, setTimeUnit] = useState(defaultUnit)
  const [timeInput, setTimeInput] = useState(
    initialValues?.time_spent_minutes
      ? minutesToDisplay(initialValues.time_spent_minutes, defaultUnit)
      : ''
  )
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [tagIds, setTagIds] = useState(initialValues?.tag_ids ?? [])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function switchUnit(unit) {
    if (unit === timeUnit) return
    const parsed = parseFloat(timeInput)
    if (!isNaN(parsed) && parsed > 0) {
      if (unit === 'hours') {
        setTimeInput((parsed / 60).toFixed(2).replace(/\.?0+$/, ''))
      } else {
        setTimeInput(String(Math.round(parsed * 60)))
      }
    }
    setTimeUnit(unit)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}

    if (!taskName.trim()) newErrors.taskName = 'Task name is required.'

    const parsed = parseFloat(timeInput)
    let minutes = 0
    if (isNaN(parsed) || parsed <= 0) {
      newErrors.time = 'Enter a positive value.'
    } else {
      minutes = timeUnit === 'hours' ? Math.round(parsed * 60) : Math.round(parsed)
      if (minutes <= 0) newErrors.time = 'Time must be greater than zero.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      await onSubmit({
        task_name: taskName.trim(),
        date,
        time_spent_minutes: minutes,
        notes: notes.trim() || null,
        tag_ids: tagIds,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Task name */}
      <div>
        <label htmlFor="task_name" className="block text-sm font-medium text-gray-700 mb-1">
          Task name <span className="text-red-500">*</span>
        </label>
        <input
          id="task_name"
          type="text"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          placeholder="What did you work on?"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.taskName && <p className="text-red-600 text-xs mt-1">{errors.taskName}</p>}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Time spent */}
      <div>
        <label htmlFor="time_input" className="block text-sm font-medium text-gray-700 mb-1">
          Time spent <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id="time_input"
            type="number"
            min="0"
            step={timeUnit === 'hours' ? '0.25' : '1'}
            value={timeInput}
            onChange={e => setTimeInput(e.target.value)}
            placeholder={timeUnit === 'hours' ? '1.5' : '90'}
            className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex rounded-md border border-gray-300 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => switchUnit('hours')}
              className={`px-3 py-2 transition-colors ${
                timeUnit === 'hours'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              hrs
            </button>
            <button
              type="button"
              onClick={() => switchUnit('minutes')}
              className={`px-3 py-2 border-l border-gray-300 transition-colors ${
                timeUnit === 'minutes'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              min
            </button>
          </div>
        </div>
        {errors.time && <p className="text-red-600 text-xs mt-1">{errors.time}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any details about this work…"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <TagSelector tags={tags} selected={tagIds} onChange={setTagIds} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-indigo-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
