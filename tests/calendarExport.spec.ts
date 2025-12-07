import { expect, test } from '@playwright/test'
import { buildICalendar, type PlannerCalendarItem } from '../app/lib/calendarExport'

test('buildICalendar creates valid calendar with escaped text', () => {
  const items: PlannerCalendarItem[] = [
    {
      id: 'sample-1',
      name: 'Scholarship, with comma',
      sponsor: 'Community Org',
      deadline: '2025-03-15',
      url: 'https://example.org/apply',
      locationScope: 'state',
      states: ['NJ'],
    },
  ]

  const ics = buildICalendar(items, { calendarName: 'Test Calendar' })

  expect(ics).toContain('BEGIN:VCALENDAR')
  expect(ics).toContain('END:VCALENDAR')
    expect(ics).toMatch(/SUMMARY:Scholarship.*with comma deadline/)
    expect(ics).toContain('DTSTART;VALUE=DATE:20250315')
  expect(ics).toContain('LOCATION:NJ')
  expect(ics).toContain('X-WR-CALNAME:Test Calendar')
})

test('buildICalendar skips events with invalid dates', () => {
  const items: PlannerCalendarItem[] = [
    {
      id: 'invalid-date',
      name: 'Scholarship with bad date',
      sponsor: 'Org',
      deadline: 'not-a-date',
      url: 'https://example.org',
    },
  ]

  const ics = buildICalendar(items)

  expect(ics).toContain('BEGIN:VCALENDAR')
  expect(ics).toContain('END:VCALENDAR')
  expect(ics).not.toContain('UID:invalid-date')
})
