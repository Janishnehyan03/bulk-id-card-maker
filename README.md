# ID Card Studio

A modern bulk ID card maker with Excel import, user authentication, and template management.

## Features

### ✨ Data Import
- **Excel Support**: Import data from Excel files (.xlsx, .xls)
- **JSON Support**: Traditional JSON file import
- **Smart Field Mapping**: Automatically maps common field variations (employee_id, Employee ID, etc.)
- **Auto-Detection**: Automatically detects employee vs student data

### 🔐 User Authentication
- **Email/Password**: Secure authentication with Firebase
- **Google Sign-in**: One-click authentication with Google
- **Persistent Sessions**: Stay logged in across browser sessions
- **User Management**: Profile management with display names

### 💾 Database & Template Management
- **Save Templates**: Save custom templates to the cloud
- **Load Templates**: Access saved templates from any device
- **Template Library**: Manage your template collection
- **User-Specific**: Templates are private to each user

### 🎨 Design Features
- **Interactive Canvas**: Drag-and-drop field positioning
- **Dual-Sided Cards**: Support for front and back design
- **Field Customization**: Fonts, colors, sizes, alignment
- **Live Preview**: See changes in real-time
- **Bulk Generation**: Generate cards for all imported records

## Setup

### Prerequisites
- Node.js (v16 or higher)
- Firebase Account (for authentication and database)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd bulk-id-card-maker
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google providers
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in test mode (or production mode with security rules)

#### Configure Environment Variables
1. Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

2. Update `.env` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

3. Get these values from:
   - Firebase Console > Project Settings > General
   - Scroll to "Your apps" section
   - Copy the config object values

### Development

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Usage

### Importing Data

#### Excel Files
1. Prepare your Excel file with employee or student data
2. Use common field names like:
   - `name`, `Name`, `full_name`
   - `email`, `Email`, `email_address`
   - `employeeId`, `employee_id`, `Employee ID`
   - `position`, `Position`, `job_title`
   - And many more variations...

3. Upload via the "Import Data" section
4. The system will automatically detect and normalize field names

#### JSON Files
Standard JSON array format:
```json
[
  {
    "id": "1",
    "name": "John Doe",
    "employeeId": "EMP001",
    "position": "Software Developer",
    "email": "john@example.com"
  }
]
```

### Creating Templates

1. **Upload Template**: Use the "Upload Template" section to upload background images
2. **Design Fields**: Drag and drop fields onto your template
3. **Customize**: Adjust fonts, colors, positions, and sizes
4. **Save**: Signed-in users can save templates for future use

### Authentication Benefits

When signed in, you can:
- Save custom templates
- Access templates from any device
- Manage your template library
- Future: Share templates with others

## Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **File Processing**: xlsx (Excel), Fabric.js (Canvas)
- **PDF Generation**: jsPDF + html2canvas

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthModal.tsx   # Authentication modal
│   ├── UserMenu.tsx    # User menu component
│   ├── TemplateManager.tsx # Template save/load
│   └── DataImporter.tsx # Excel/JSON import
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── firebase/           # Firebase configuration
│   └── config.ts       # Firebase setup
├── services/           # Business logic
│   └── templateService.ts # Template database operations
└── types/              # TypeScript definitions
    └── index.ts        # Type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

Built with ❤️ using React, TypeScript, and Firebase.
