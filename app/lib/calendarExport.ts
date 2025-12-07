export type PlannerCalendarItem = {
  id: string
  name: string
  sponsor: string
  deadline: string
  url: string
  locationScope?: 'national' | 'state' | 'local'
  states?: string[]
}

type CalendarOptions = {
  calendarName?: string
  productId?: string
}

export function buildICalendar(items: PlannerCalendarItem[], options: CalendarOptions = {}): string {
  const timestamp = formatTimestamp(new Date())
  const calendarName = escapeICalText(options.calendarName || 'Scholarship deadlines')
  const productId = escapeICalText(options.productId || '-//Destination College//Scholarship Planner//EN')

  const events = items
    .map((item) => buildEvent(item, timestamp))
    .filter((value): value is string => Boolean(value))

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${productId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:UTC',
    ...events,
    'END:VCALENDAR',
  ]

  return lines.join('\r\n') + '\r\n'
}

function buildEvent(item: PlannerCalendarItem, timestamp: string): string | null {
  const start = toICalDate(item.deadline)
  if (!start) return null

  const end = incrementDate(start)
  const uid = `${escapeICalText(item.id)}@destination-college`
  const summary = `${escapeICalText(item.name)} deadline`
  const description = escapeICalText(`Sponsor: ${item.sponsor}\nApply: ${item.url}`)
  const location = formatLocation(item.locationScope, item.states)

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `URL:${escapeICalText(item.url)}`,
  ]

  if (location) lines.push(`LOCATION:${location}`)

  lines.push('END:VEVENT')
  return lines.join('\r\n')
}

function formatTimestamp(date: Date): string {
  return (
    date.getUTCFullYear().toString().padStart(4, '0') +
    (date.getUTCMonth() + 1).toString().padStart(2, '0') +
    date.getUTCDate().toString().padStart(2, '0') +
    'T' +
    date.getUTCHours().toString().padStart(2, '0') +
    date.getUTCMinutes().toString().padStart(2, '0') +
    date.getUTCSeconds().toString().padStart(2, '0') +
    'Z'
  )
}

function toICalDate(value: string): string | null {
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  const date = new Date(parsed)
  return (
    date.getUTCFullYear().toString().padStart(4, '0') +
    (date.getUTCMonth() + 1).toString().padStart(2, '0') +
    date.getUTCDate().toString().padStart(2, '0')
  )
}

function incrementDate(yyyymmdd: string): string {
  const year = Number(yyyymmdd.slice(0, 4))
  const month = Number(yyyymmdd.slice(4, 6)) - 1
  const day = Number(yyyymmdd.slice(6, 8))
  const date = new Date(Date.UTC(year, month, day + 1))
  return (
    date.getUTCFullYear().toString().padStart(4, '0') +
    (date.getUTCMonth() + 1).toString().padStart(2, '0') +
    date.getUTCDate().toString().padStart(2, '0')
  )
}

function formatLocation(scope?: PlannerCalendarItem['locationScope'], states?: string[]): string | null {
  if (!scope) return null
  if (scope === 'national') return 'United States'
  if (scope === 'state') return escapeICalText(states?.[0] || 'State-specific')
  return escapeICalText(states?.join('/') || 'Local region')
}

function escapeICalText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}
