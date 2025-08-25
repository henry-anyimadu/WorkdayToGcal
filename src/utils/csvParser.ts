import Papa from 'papaparse';
import type { Course, ParsedCourseData, MeetingPattern } from '../types/course';

export function parseWorkdayCSV(csvContent: string): ParsedCourseData {
  const result = Papa.parse(csvContent, {
    header: false,
    skipEmptyLines: true
  });

  const rows = result.data as string[][];
  
  // Extract student info from the first data row (row 3, index 3)
  const studentInfo = extractStudentInfo(rows[3] ? rows[3][0] : '');
  
  // Parse courses starting from row 4 (index 3)
  const courses: Course[] = [];
  
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (row.length > 1 && row[1]) { // Check if course listing exists
      try {
        const course = parseCourseRow(row);
        if (course) {
          courses.push(course);
        }
      } catch (error) {
        console.warn(`Failed to parse course row ${i + 1}:`, error);
      }
    }
  }

  return {
    courses,
    studentInfo
  };
}

function extractStudentInfo(firstRowData: string): ParsedCourseData['studentInfo'] {
  // Parse student info from the first column of data rows
  // Format: "Anyimadu, Henry K (517853) - McKelvey School of Engineering/Undergraduate..."
  const match = firstRowData.match(/^([^(]+)\s*\((\d+)\)\s*-\s*([^/]+)\/(.+?)\s*-/);
  
  if (match) {
    return {
      name: match[1].trim(),
      id: match[2],
      school: match[3].trim(),
      program: match[4].split(' - ')[0].trim()
    };
  }
  
  return {
    name: 'Unknown Student',
    id: '',
    school: '',
    program: ''
  };
}

function parseCourseRow(row: string[]): Course | null {
  if (row.length < 14) return null;

  const [
    ,
    courseListing,
    ,
    ,
    creditHours,
    gradingBasis,
    section,
    registrationStatus,
    instructionalFormat,
    deliveryMode,
    meetingPatterns,
    instructor,
    startDate,
    endDate
  ] = row;

  if (!courseListing) return null;

  // Parse course ID and title from course listing
  const courseMatch = courseListing.match(/^([A-Z\s]+\s+\d+)\s*-\s*(.+)$/);
  if (!courseMatch) return null;

  const [, courseId, title] = courseMatch;

  return {
    id: courseId.trim(),
    title: title.trim(),
    section: section || '',
    creditHours: parseFloat(creditHours) || 0,
    gradingBasis: gradingBasis || '',
    registrationStatus: registrationStatus || '',
    instructionalFormat: instructionalFormat || '',
    deliveryMode: deliveryMode || '',
    meetingPatterns: parseMeetingPatterns(meetingPatterns || ''),
    instructor: instructor || '',
    startDate: startDate || '',
    endDate: endDate || ''
  };
}

function parseMeetingPatterns(meetingPatternStr: string): MeetingPattern[] {
  if (!meetingPatternStr || meetingPatternStr.trim() === '') {
    return [];
  }

  const patterns: MeetingPattern[] = [];
  
  // Split by pipe for multiple patterns
  const patternParts = meetingPatternStr.split('|').map(p => p.trim());
  
  if (patternParts.length >= 3) {
    const daysStr = patternParts[0];
    const timeStr = patternParts[1];
    const locationStr = patternParts[2];

    // Parse days (e.g., "Tue/Thu", "Mon/Wed", "Fri")
    const days = parseDays(daysStr);
    
    // Parse time (e.g., "2:30 PM - 3:50 PM")
    const { startTime, endTime } = parseTime(timeStr);
    
    // Parse location (e.g., "MUSIC CLRM, Room 00102")
    const { location, room } = parseLocation(locationStr);

    if (days.length > 0 && startTime && endTime) {
      patterns.push({
        days,
        startTime,
        endTime,
        location,
        room
      });
    }
  }

  return patterns;
}

function parseDays(daysStr: string): string[] {
  const dayMap: { [key: string]: string } = {
    'Mon': 'MO',
    'Tue': 'TU', 
    'Wed': 'WE',
    'Thu': 'TH',
    'Fri': 'FR',
    'Sat': 'SA',
    'Sun': 'SU'
  };

  const days: string[] = [];
  
  // Split by '/' and map to calendar day codes
  const dayParts = daysStr.split('/');
  for (const day of dayParts) {
    const trimmedDay = day.trim();
    if (dayMap[trimmedDay]) {
      days.push(dayMap[trimmedDay]);
    }
  }

  return days;
}

function parseTime(timeStr: string): { startTime: string; endTime: string } {
  // Parse time format like "2:30 PM - 3:50 PM"
  const timeMatch = timeStr.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
  
  if (timeMatch) {
    return {
      startTime: timeMatch[1].trim(),
      endTime: timeMatch[2].trim()
    };
  }

  return { startTime: '', endTime: '' };
}

function parseLocation(locationStr: string): { location?: string; room?: string } {
  // Parse location format like "MUSIC CLRM, Room 00102" or "SIMON, Room 00122"
  const parts = locationStr.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    const location = parts[0];
    const roomMatch = parts[1].match(/Room\s+(.+)/i);
    const room = roomMatch ? roomMatch[1] : parts[1];
    
    return { location, room };
  } else if (parts.length === 1 && parts[0]) {
    return { location: parts[0] };
  }

  return {};
}
