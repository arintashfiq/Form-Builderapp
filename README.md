# 🚀 Marketing Campaign Form Builder

A comprehensive full-stack web application for creating dynamic marketing campaign forms with drag-and-drop functionality, conditional logic, and responsive design.

![Form Builder](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

## ✨ Features

### 🎯 **Core Requirements (All Implemented)**

**📋 Form Builder Components:**
- 📝 **Text Input** - Min/max length validation, required field options
- 📋 **Multiple Choice Dropdown** - Custom options with conditional logic
- 📊 **Dynamic Table** - Mixed column types (text + dropdown combinations)
- 📎 **File Upload** - Multiple file types, 10MB limit (Bonus feature)

**🎨 Form Display & Layout:**
- 🏗️ **Drag & Drop Columns** - Organize fields into responsive columns
- 📱 **Responsive Design** - Mobile and desktop optimized layouts
- 🎯 **Visual Form Builder** - Intuitive drag-and-drop interface
- 🔄 **Real-time Preview** - See changes instantly

**⚡ Advanced Features:**
- 🔀 **Conditional Logic** - Jump to questions based on dropdown selections
- 💾 **Auto-save Protection** - Explicit save changes for field editing
- ✅ **Comprehensive Validation** - Client and server-side validation
- 📊 **Submissions Viewer** - View and export form responses
- 🗄️ **Database Integration** - Full MySQL persistence

## 🛠️ Tech Stack

**Frontend:**
- ⚛️ **React 18** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🖱️ **React DnD** for drag-and-drop functionality
- 🧭 **React Router** for navigation
- 📡 **Axios** for API communication
- 🔧 **Vite** for development and building

**Backend:**
- 🟢 **Node.js** with TypeScript
- 🚀 **Express.js** framework
- 🗄️ **MySQL** database with JSON fields
- 📁 **Multer** for file uploads
- ✅ **Joi** for data validation
- 🔄 **ts-node-dev** for development

**Development Tools:**
- 📝 **TypeScript** for type safety
- 🎯 **ESLint** for code quality
- 🔧 **Concurrently** for running multiple processes

## 🎬 Demo

### Live Application Features:
- **📝 Form Creation**: Drag & drop interface for building forms
- **🎨 Layout Design**: Multi-column responsive layouts
- **👀 Live Preview**: Test forms before publishing
- **📊 Data Management**: View and export form submissions
- **🔧 Field Editing**: Comprehensive field configuration options

## 🚀 Quick Start

### Prerequisites
- 🟢 **Node.js 18+** 
- 🗄️ **MySQL 8.0+**
- 📦 **npm** or **yarn**

### ⚡ Installation

**Option 1: One-Command Setup**
```bash
chmod +x install.sh && ./install.sh
```

**Option 2: Manual Setup**
```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up MySQL database
mysql -u root -e "CREATE DATABASE form_builder;"

# 3. Configure environment
cd backend && cp .env.example .env
# Edit .env with your MySQL credentials

# 4. Start the application
npm run dev
```

### Database Setup
```sql
mysql -u root -p
CREATE DATABASE form_builder;
exit
```

### Environment Configuration
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials:
# DB_HOST=localhost
# DB_USER=your_mysql_user
# DB_PASSWORD=your_mysql_password
# DB_NAME=form_builder
# DB_PORT=3306
cd ..
```

### Start the Application
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Verify Installation
- Visit http://localhost:3001/api/health to check backend
- Visit http://localhost:3000 to access the form builder

## Project Structure

```
form-builder/
├── frontend/          # React TypeScript app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Main application pages
│   │   ├── contexts/      # React context for state management
│   │   └── services/      # API service layer
├── backend/           # Node.js TypeScript API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   └── database.ts    # Database configuration
└── shared/            # Shared TypeScript types
```

## Usage Guide

### Creating a Form

1. **Navigate to Form Builder** - Click "Create New Form" or use the Builder tab
2. **Add Fields** - Click on field types in the sidebar to add them
3. **Configure Fields** - Click the settings icon to edit questions, validation, and options
4. **Organize Layout** - Create columns and drag fields to organize your form
5. **Preview & Test** - Use the Preview button to test your form
6. **Save** - Click Save to store your form

### Form Field Types

**Text Input:**
- Required/optional validation
- Min/max length constraints
- Custom question text

**Dropdown:**
- Multiple choice options
- Conditional logic support
- Required field validation

**Table:**
- Dynamic columns
- Mixed input types (text + dropdown)
- Add/remove rows functionality

**File Upload:**
- Multiple file support
- File type restrictions
- Size limits (10MB max)

### Conditional Logic

Set up form flows where dropdown selections can:
- Jump to specific questions
- Show/hide other fields
- Create dynamic user experiences

### Responsive Design

Forms automatically adapt to:
- Mobile devices (stacked layout)
- Tablets (optimized columns)
- Desktop (full column layout)

## API Endpoints

### Forms
- `GET /api/forms` - List all forms
- `GET /api/forms/:id` - Get specific form
- `POST /api/forms` - Create new form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Submissions
- `POST /api/forms/:id/submit` - Submit form data
- `GET /api/forms/:id/submissions` - Get form submissions

### File Upload
- `POST /api/upload` - Upload files

## Database Schema

**Forms Table:**
- id (VARCHAR) - Primary key
- name (VARCHAR) - Form name
- fields (JSON) - Form field definitions
- columns (JSON) - Layout configuration
- created_at, updated_at (TIMESTAMP)

**Form Submissions Table:**
- id (VARCHAR) - Primary key
- form_id (VARCHAR) - Foreign key to forms
- data (JSON) - Submitted form data
- submitted_at (TIMESTAMP)

## Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:backend

# Build for production
npm run build
```

### Component Architecture

The application follows a component-based architecture with:

- **Reusable Field Components** - Each form field type has its own component
- **Context-based State Management** - React Context for form state
- **Service Layer** - Abstracted API calls
- **Shared Types** - TypeScript interfaces shared between frontend and backend

## Production Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Set up production database**
3. **Configure environment variables**
4. **Deploy backend and serve frontend build**

## Contributing

This project was built as a sprint deliverable for a marketing agency. The codebase is designed to be:

- **Modular** - Easy to extend with new field types
- **Scalable** - Component-based architecture
- **Maintainable** - TypeScript throughout
- **Testable** - Clear separation of concerns

## 🆕 Latest Features

### **Drag & Drop Field Organization**
- Drag fields from the main area to columns in the sidebar
- Visual drop zones with hover feedback
- Fields organized by columns in the main form area
- Unassigned fields section for better organization

### **Enhanced Field Editor**
- No more auto-save issues with dropdown/table field editing
- Explicit "Save Changes" button for field modifications
- Unsaved changes indicator in the editor header
- Cancel button to revert changes

### **Submissions Management**
- Comprehensive submissions viewer page
- Export form responses to CSV
- Real-time data from MySQL database
- Command-line database access tools

### **Database Access Tools**
- Web-based submissions viewer
- Command-line database viewer script (`./view-database.sh`)
- Direct MySQL access commands
- API endpoints for programmatic access

## 📊 Database Schema

The application uses MySQL with the following structure:

**Forms Table:**
- `id` (VARCHAR) - Primary key
- `name` (VARCHAR) - Form name
- `fields` (JSON) - Form field definitions
- `columns` (JSON) - Layout configuration
- `created_at`, `updated_at` (TIMESTAMP)

**Form Submissions Table:**
- `id` (VARCHAR) - Primary key
- `form_id` (VARCHAR) - Foreign key to forms
- `data` (JSON) - Submitted form data
- `submitted_at` (TIMESTAMP)

## 🤝 Contributing

This project was built as a comprehensive form builder solution. The codebase is designed to be:

- **Modular** - Easy to extend with new field types
- **Scalable** - Component-based architecture
- **Maintainable** - TypeScript throughout
- **Testable** - Clear separation of concerns

## 📄 License

MIT License - Feel free to use this project for your own applications.