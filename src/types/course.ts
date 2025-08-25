export interface MeetingPattern {
  days: string[];
  startTime: string;
  endTime: string;
  location?: string;
  room?: string;
}

export interface Course {
  id: string;
  title: string;
  section: string;
  creditHours: number;
  gradingBasis: string;
  registrationStatus: string;
  instructionalFormat: string;
  deliveryMode: string;
  meetingPatterns: MeetingPattern[];
  instructor: string;
  startDate: string;
  endDate: string;
}

export interface ParsedCourseData {
  courses: Course[];
  studentInfo: {
    name: string;
    id: string;
    school: string;
    program: string;
  };
}

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  recurrence?: {
    frequency: 'WEEKLY';
    until: Date;
    byDay: string[];
  };
}
