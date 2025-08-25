# 📅 Course Scheduler

A modern web application that transforms Workday course spreadsheets into exportable calendar files. Built with Vue 3, TypeScript, and Vite.

## ✨ Features

- **📄 CSV Upload**: Drag-and-drop or browse to upload Workday course export files
- **📊 Course Display**: Beautiful, organized view of your enrolled courses
- **👤 Student Info**: Displays parsed student information from the spreadsheet
- **📈 Course Summary**: Shows total courses, credit hours, and registration status
- **📅 Calendar Export**: Generates ICS calendar files with recurring class events
- **🎨 Modern UI**: Beautiful gradient design with responsive layout
- **⚡ Fast Processing**: Instant CSV parsing and calendar generation
- **📱 Mobile Friendly**: Responsive design that works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v20.19.0 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd course-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📋 How to Use

1. **Export from Workday**: 
   - Log into your Workday student portal
   - Navigate to your enrolled courses
   - Export the course schedule as a CSV file

2. **Upload to Course Scheduler**:
   - Drag and drop your CSV file onto the upload area
   - Or click to browse and select your file

3. **Review Your Courses**:
   - View your student information and course summary
   - Check all enrolled courses with their schedules

4. **Export Calendar**:
   - Click "Export Calendar" to download an ICS file
   - Import the ICS file into your preferred calendar app

## 🛠️ Development

### Project Structure

```
src/
├── components/           # Vue components
│   ├── FileUpload.vue   # File upload with drag-and-drop
│   └── CourseDisplay.vue # Course information display
├── types/               # TypeScript type definitions
│   └── course.ts        # Course and calendar interfaces
├── utils/               # Utility functions
│   ├── csvParser.ts     # Workday CSV parsing logic
│   └── calendarGenerator.ts # ICS calendar generation
├── App.vue              # Main application component
├── main.ts              # Application entry point
└── style.css            # Global styles
```

### Key Technologies

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Papa Parse** - CSV parsing library
- **ICS** - Calendar file generation
- **Date-fns** - Date manipulation utilities

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 Supported File Formats

- **CSV**: Comma-separated values (primary format)
- **Excel**: not supported, but planned in a future release

## 🗓️ Calendar Features

The generated calendar includes:

- **Recurring Events**: Automatically creates weekly recurring class sessions
- **Course Details**: Full course information in event descriptions
- **Location Data**: Classroom and building information
- **Proper Timing**: Accurate start and end times for each class
- **Semester Bounds**: Events only occur within course date ranges

## 🔧 Configuration

The application automatically handles:
- Date parsing in multiple formats
- Time zone handling
- Meeting pattern interpretation (Mon/Wed, Tue/Thu, etc.)
- Location parsing (building and room numbers)

## 🐛 Troubleshooting

### Common Issues

1. **File not parsing correctly**:
   - Ensure the CSV is exported directly from Workday
   - Check that the file includes the standard Workday column headers

2. **Missing course information**:
   - Verify all required fields are present in the CSV
   - Some fields may be optional (location, instructor, etc.)

3. **Calendar events not showing**:
   - Check that course dates are properly formatted
   - Ensure meeting patterns are in the expected format

### Error Messages

- "No courses found": The CSV doesn't contain recognizable course data
- "Failed to parse file": The file format is not supported or corrupted
- "File size too large": Maximum file size is 10MB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by Henry Anyimadu, 2025
- Inspired by Silas Hsu's [WebSTAC to Google Calendar](https://github.com/smhsu/webstacToCal)