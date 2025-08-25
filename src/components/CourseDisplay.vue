<template>
  <div class="course-display">
    <div v-if="data" class="course-container">
      <!-- Student Information -->
      <div class="student-info">
        <h2>Student Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Name:</label>
            <span>{{ data.studentInfo.name }}</span>
          </div>
          <div class="info-item">
            <label>Student ID:</label>
            <span>{{ data.studentInfo.id }}</span>
          </div>
          <div class="info-item">
            <label>School:</label>
            <span>{{ data.studentInfo.school }}</span>
          </div>
          <div class="info-item">
            <label>Program:</label>
            <span>{{ data.studentInfo.program }}</span>
          </div>
        </div>
      </div>

      <!-- Course Summary -->
      <div class="course-summary">
        <h2>Course Summary</h2>
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-number">{{ data.courses.length }}</span>
            <span class="stat-label">Total Courses</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ totalCreditHours }}</span>
            <span class="stat-label">Credit Hours</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ registeredCourses }}</span>
            <span class="stat-label">Registered</span>
          </div>
        </div>
      </div>

      <!-- Courses List -->
      <div class="courses-section">
        <div class="section-header">
          <h2>Enrolled Courses</h2>
          <div class="export-actions">
            <button @click="exportCalendar" :disabled="isExporting" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ isExporting ? 'Exporting...' : 'Export Calendar' }}
            </button>
          </div>
        </div>

        <div class="courses-grid">
          <div v-for="course in data.courses" :key="course.id + course.section" class="course-card">
            <div class="course-header">
              <h3 class="course-title">{{ course.id }}</h3>
              <span class="course-section">{{ course.section }}</span>
            </div>
            
            <h4 class="course-name">{{ course.title }}</h4>
            
            <div class="course-details">
              <div class="detail-row">
                <span class="detail-label">Credit Hours:</span>
                <span class="detail-value">{{ course.creditHours }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Instructor:</span>
                <span class="detail-value">{{ course.instructor }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Format:</span>
                <span class="detail-value">{{ course.instructionalFormat }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Delivery:</span>
                <span class="detail-value">{{ course.deliveryMode }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value status" :class="getStatusClass(course.registrationStatus)">
                  {{ course.registrationStatus }}
                </span>
              </div>
            </div>

            <!-- Meeting Patterns -->
            <div v-if="course.meetingPatterns.length > 0" class="meeting-patterns">
              <h5>Schedule:</h5>
              <div v-for="(pattern, index) in course.meetingPatterns" :key="index" class="pattern">
                <div class="pattern-time">
                  <span class="days">{{ formatDays(pattern.days) }}</span>
                  <span class="time">{{ pattern.startTime }} - {{ pattern.endTime }}</span>
                </div>
                <div v-if="pattern.location || pattern.room" class="pattern-location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ pattern.location }}{{ pattern.room ? `, ${pattern.room}` : '' }}
                </div>
              </div>
            </div>

            <!-- Course Dates -->
            <div class="course-dates">
              <span class="date-range">{{ formatDateRange(course.startDate, course.endDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="exportSuccess" class="success-message">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Calendar exported successfully!
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ParsedCourseData } from '../types/course'
import { generateCalendarFromCourses, downloadCalendar } from '../utils/calendarGenerator'

interface Props {
  data: ParsedCourseData | null
}

const props = defineProps<Props>()
const isExporting = ref(false)
const exportSuccess = ref(false)

const totalCreditHours = computed(() => {
  if (!props.data) return 0
  return props.data.courses.reduce((total, course) => total + course.creditHours, 0)
})

const registeredCourses = computed(() => {
  if (!props.data) return 0
  return props.data.courses.filter(course => 
    course.registrationStatus.toLowerCase() === 'registered'
  ).length
})

function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'registered':
      return 'status-registered'
    case 'waitlisted':
      return 'status-waitlisted'
    case 'dropped':
      return 'status-dropped'
    default:
      return 'status-default'
  }
}

function formatDays(days: string[]): string {
  const dayMap: { [key: string]: string } = {
    'MO': 'Mon',
    'TU': 'Tue', 
    'WE': 'Wed',
    'TH': 'Thu',
    'FR': 'Fri',
    'SA': 'Sat',
    'SU': 'Sun'
  }
  
  return days.map(day => dayMap[day] || day).join('/')
}

function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return ''
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
}

async function exportCalendar() {
  if (!props.data || props.data.courses.length === 0) return
  
  isExporting.value = true
  exportSuccess.value = false
  
  try {
    const calendarContent = generateCalendarFromCourses(props.data.courses)
    const filename = `${props.data.studentInfo.name.replace(/\s+/g, '_')}_courses.ics`
    downloadCalendar(calendarContent, filename)
    
    exportSuccess.value = true
    setTimeout(() => {
      exportSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to export calendar:', error)
    // Could emit an error event here
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
.course-display {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.course-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.student-info {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.student-info h2 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
}

.info-item span {
  color: #1e293b;
}

.course-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.course-summary h2 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.summary-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.courses-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.export-actions {
  margin-left: auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.course-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.course-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.course-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #3b82f6;
}

.course-section {
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.course-name {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
}

.course-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-weight: 500;
  color: #64748b;
  font-size: 0.875rem;
}

.detail-value {
  color: #1e293b;
  font-size: 0.875rem;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
}

.status-registered {
  background: #dcfce7;
  color: #16a34a;
}

.status-waitlisted {
  background: #fef3c7;
  color: #d97706;
}

.status-dropped {
  background: #fee2e2;
  color: #dc2626;
}

.status-default {
  background: #f1f5f9;
  color: #64748b;
}

.meeting-patterns {
  margin-bottom: 1rem;
}

.meeting-patterns h5 {
  margin: 0 0 0.75rem 0;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.pattern {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.pattern-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.days {
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.875rem;
}

.time {
  color: #64748b;
  font-size: 0.875rem;
}

.pattern-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
  font-size: 0.75rem;
}

.course-dates {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  text-align: center;
}

.date-range {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  color: #065f46;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .course-display {
    padding: 1rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    justify-content: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .export-actions {
    margin-left: 0;
  }
}
</style>
