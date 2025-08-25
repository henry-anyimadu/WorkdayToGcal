<script setup lang="ts">
import { ref } from 'vue'
import FileUpload from './components/FileUpload.vue'
import CourseDisplay from './components/CourseDisplay.vue'
import { parseWorkdayCSV } from './utils/csvParser'
import type { ParsedCourseData } from './types/course'

const courseData = ref<ParsedCourseData | null>(null)
const error = ref<string>('')
const isLoading = ref(false)

async function handleFileProcessed(content: string) {
  isLoading.value = true
  error.value = ''
  
  try {
    const parsed = parseWorkdayCSV(content)
    courseData.value = parsed
    
    if (parsed.courses.length === 0) {
      error.value = 'No courses found in the uploaded file. Please check the file format.'
    }
  } catch (err) {
    console.error('Error parsing CSV:', err)
    error.value = 'Failed to parse the uploaded file. Please ensure it\'s a valid .csv file exported from Workday.'
  } finally {
    isLoading.value = false
  }
}

function handleError(message: string) {
  error.value = message
}

function resetApp() {
  courseData.value = null
  error.value = ''
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          WashU Workday to Google Calendar
        </h1>
        <p class="app-subtitle">Transform your Workday course spreadsheet into a .ics file for Google Calendar/Apple Calendar</p>
        
        <button v-if="courseData" @click="resetApp" class="btn btn-outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="1,4 1,10 7,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Upload New File
        </button>
      </div>
    </header>

    <main class="app-main">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Processing your course data...</p>
      </div>

      <div v-else-if="!courseData" class="upload-state">
        <FileUpload 
          @file-processed="handleFileProcessed"
          @error="handleError"
        />
        
        <div v-if="error" class="error-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ error }}
        </div>

        <section class="info-sections">
          <div class="info-card">
            <h2 class="info-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="5.2" y1="5.2" x2="7.4" y2="7.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="16.6" y1="16.6" x2="18.8" y2="18.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="16.6" y1="5.2" x2="18.8" y2="7.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="5.2" y1="16.6" x2="7.4" y2="18.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              How to Use
            </h2>
            <p class="info-text">
              Step 1: Visit the "Current Classes" page in Workday <br />
              Step 2: Click the "Export to Worksheets button" (Second from the left) <br />
              Step 3: Navigate to "File > Download as... > Comma-separated values (.csv)" <br />  
              Step 4: Upload the CSV file here! <br />
              Step 5: Export the .ics file, and add it to your preferred calendar app!
            </p>
          </div>

          <div class="info-card">
            <h2 class="info-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5 L13.2 8.8 L17 10 L13.2 11.2 L12 15 L10.8 11.2 L7 10 L10.8 8.8 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M18 6 L18.6 8 L20 8.6 L18.6 9.2 L18 11 L17.4 9.2 L16 8.6 L17.4 8 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              </svg>
              About this App
            </h2>
            <p class="info-text">
              This tool is designed to be a lightning fast way for WashU students to get their courses into their preferred calendars.
              As someone who religiously used Silas Hsu's <a href="https://github.com/smhsu/webstacToCal">WebSTAC to Google Calendar</a>, I wanted to make a tool that replicates this
              functionality for the new Workday system. I hope you enjoy using it! <br /> <br />
              Feel free to reach out to me on <a href="https://www.linkedin.com/in/anyimadu">LinkedIn</a> or <a href="https://github.com/henryanyimadu">GitHub</a> with any feedback or suggestions! <br />
            </p>
          </div>
        </section>
      </div>

      <div v-else class="course-state">
        <CourseDisplay :data="courseData" />
      </div>
    </main>

    <footer class="app-footer">
      <p>&copy; 2025 WashU Workday Parser. Made with ❤️ by Henry Anyimadu</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
  color: white;
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.app-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
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
  text-decoration: none;
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.app-main {
  flex: 1;
  padding: 2rem 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-state {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.info-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.info-card {
  background: #f5efe6;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.info-title {
  margin: 0 0 0.75rem 0;
  color: #7c2d12;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
}

.info-text {
  margin: 0;
  color: #320000;
  font-size: 0.95rem;
  line-height: 1.7;
  text-align: left;
}

.course-state {
  background: #f5efe6;
  border-radius: 20px 20px 0 0;
  min-height: 60vh;
  margin-top: 2rem;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0;
  max-width: 600px;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fef2f2;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
}

.app-footer {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 1.5rem;
  font-size: 0.875rem;
}

.app-footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }
  
  .header-content {
    padding: 0 1rem;
  }
  
  .upload-state {
    padding: 0 1rem;
  }

  .info-sections {
    grid-template-columns: 1fr;
  }
}
</style>
