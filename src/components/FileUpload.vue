<template>
  <div class="file-upload">
    <div class="upload-area" 
         :class="{ 'dragover': isDragOver, 'has-file': selectedFile }"
         @dragover.prevent="isDragOver = true"
         @dragleave.prevent="isDragOver = false"
         @drop.prevent="handleDrop"
         @click="triggerFileInput">
      
      <input 
        ref="fileInput"
        type="file" 
        accept=".csv,.xlsx,.xls"
        @change="handleFileSelect"
        class="file-input"
      />
      
      <div class="upload-content">
        <div class="upload-icon">
          <svg v-if="!selectedFile" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          
          <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <div class="upload-text">
          <h3 v-if="!selectedFile">Upload Workday Course Spreadsheet</h3>
          <h3 v-else>File Selected</h3>
          
          <p v-if="!selectedFile">
            Drag and drop your CSV file here or <span class="link-text">click to browse</span>
          </p>
          <p v-else class="file-name">{{ selectedFile.name }}</p>
          
          <p class="file-types">Supported formats: CSV, Excel (.xlsx, .xls)</p>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
      </svg>
      {{ error }}
    </div>
    
    <div v-if="selectedFile && !error" class="file-actions">
      <button @click="processFile" :disabled="isProcessing" class="btn btn-primary">
        <span v-if="!isProcessing">Process File</span>
        <span v-else>Processing...</span>
      </button>
      <button @click="clearFile" class="btn btn-secondary">
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  fileProcessed: [content: string, fileName: string]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const error = ref('')
const isProcessing = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    setSelectedFile(file)
  }
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    setSelectedFile(file)
  }
}

function setSelectedFile(file: File) {
  error.value = ''
  
  // Validate file type
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  const isValidType = validTypes.includes(file.type) || 
                     file.name.toLowerCase().endsWith('.csv') ||
                     file.name.toLowerCase().endsWith('.xlsx') ||
                     file.name.toLowerCase().endsWith('.xls')
  
  if (!isValidType) {
    error.value = 'Please select a valid CSV or Excel file'
    return
  }
  
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'File size must be less than 10MB'
    return
  }
  
  selectedFile.value = file
}

function clearFile() {
  selectedFile.value = null
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function processFile() {
  if (!selectedFile.value) return
  
  isProcessing.value = true
  error.value = ''
  
  try {
    const content = await readFileContent(selectedFile.value)
    emit('fileProcessed', content, selectedFile.value.name)
  } catch (err) {
    error.value = 'Failed to read file. Please try again.'
    emit('error', error.value)
  } finally {
    isProcessing.value = false
  }
}

function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }
    
    reader.readAsText(file)
  })
}
</script>

<style scoped>
.file-upload {
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-area.dragover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: scale(1.02);
}

.upload-area.has-file {
  border-color: #10b981;
  background: #ecfdf5;
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.upload-icon {
  color: #64748b;
}

.upload-area.has-file .upload-icon {
  color: #10b981;
}

.upload-text h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.upload-text p {
  margin: 0.5rem 0 0 0;
  color: #64748b;
}

.file-name {
  font-weight: 600;
  color: #10b981 !important;
}

.link-text {
  color: #3b82f6;
  text-decoration: underline;
}

.file-types {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
}

.file-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
}

.btn {
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

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}
</style>
