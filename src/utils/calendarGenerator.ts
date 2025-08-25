import { createEvents, type EventAttributes } from 'ics';
import { parse, addWeeks } from 'date-fns';
import type { Course, MeetingPattern } from '../types/course';

export function generateCalendarFromCourses(courses: Course[]): string {
  const events: EventAttributes[] = [];

  for (const course of courses) {
    const courseEvents = createEventsFromCourse(course);
    events.push(...courseEvents);
  }

  const { error, value } = createEvents(events);
  
  if (error) {
    console.error('Error creating calendar:', error);
    throw new Error('Failed to generate calendar');
  }

  return value || '';
}

function createEventsFromCourse(course: Course): EventAttributes[] {
  const events: EventAttributes[] = [];

  for (const pattern of course.meetingPatterns) {
    if (pattern.days.length === 0 || !pattern.startTime || !pattern.endTime) {
      continue;
    }

    // Parse course start and end dates
    const courseStartDate = parseDate(course.startDate);
    const courseEndDate = parseDate(course.endDate);

    if (!courseStartDate || !courseEndDate) {
      continue;
    }

    // Create events for each day of the week
    for (const dayCode of pattern.days) {
      const dayEvents = createRecurringEvents(
        course,
        pattern,
        dayCode,
        courseStartDate,
        courseEndDate
      );
      events.push(...dayEvents);
    }
  }

  return events;
}

function createRecurringEvents(
  course: Course,
  pattern: MeetingPattern,
  dayCode: string,
  startDate: Date,
  endDate: Date
): EventAttributes[] {
  const events: EventAttributes[] = [];
  
  // Map day codes to day numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap: { [key: string]: number } = {
    'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
  };

  const targetDayOfWeek = dayMap[dayCode];
  if (targetDayOfWeek === undefined) return events;

  // Find the first occurrence of this day of week on or after the start date
  let currentDate = new Date(startDate);
  while (currentDate.getDay() !== targetDayOfWeek) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Parse start and end times
  const startTime = parseTimeString(pattern.startTime);
  const endTime = parseTimeString(pattern.endTime);

  if (!startTime || !endTime) return events;

  // Create recurring events until the end date
  while (currentDate <= endDate) {
    const eventStart = new Date(currentDate);
    eventStart.setHours(startTime.hours, startTime.minutes, 0, 0);

    const eventEnd = new Date(currentDate);
    eventEnd.setHours(endTime.hours, endTime.minutes, 0, 0);

    const location = pattern.location && pattern.room 
      ? `${pattern.location}, ${pattern.room}`
      : pattern.location || pattern.room || '';

    events.push({
      title: `${course.id} - ${course.title}`,
      start: [
        eventStart.getFullYear(),
        eventStart.getMonth() + 1,
        eventStart.getDate(),
        eventStart.getHours(),
        eventStart.getMinutes()
      ],
      end: [
        eventEnd.getFullYear(),
        eventEnd.getMonth() + 1,
        eventEnd.getDate(),
        eventEnd.getHours(),
        eventEnd.getMinutes()
      ],
      description: [
        `Course: ${course.id} - ${course.title}`,
        `Section: ${course.section}`,
        `Instructor: ${course.instructor}`,
        `Credit Hours: ${course.creditHours}`,
        `Format: ${course.instructionalFormat}`,
        `Delivery: ${course.deliveryMode}`
      ].join('\\n'),
      location: location,
      categories: ['Course', course.id.split(' ')[0]], // Subject area as category
      status: 'CONFIRMED'
    });

    // Move to next week
    currentDate = addWeeks(currentDate, 1);
  }

  return events;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try different date formats commonly used
  const formats = [
    'M/d/yyyy',
    'MM/dd/yyyy',
    'M/d/yy',
    'MM/dd/yy'
  ];

  for (const formatStr of formats) {
    try {
      const parsed = parse(dateStr, formatStr, new Date());
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {
      // Continue to next format
    }
  }

  // Try parsing as ISO date
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch {
    // Fall through
  }

  console.warn(`Could not parse date: ${dateStr}`);
  return null;
}

function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  // Parse time format like "2:30 PM" or "11:20 AM"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

export function downloadCalendar(calendarContent: string, filename: string = 'courses.ics'): void {
  const blob = new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}
