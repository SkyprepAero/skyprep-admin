# SkyPrep Admin Panel

A comprehensive React admin panel for managing test series with subjects, chapters, questions, and options. Built with React, Vite, Tailwind CSS, and shadcn/ui components.

## Features

- **Subject Management**: Create, edit, delete, and restore subjects
- **Chapter Management**: Organize chapters within subjects
- **Question Management**: Create multiple choice questions with options
- **Soft Delete System**: Safe deletion with restore functionality
- **Advanced Filtering**: Search and filter by various criteria
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean and intuitive design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd skyprep-admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment configuration:
```bash
# Run the setup script to create .env file
npm run setup
```

Or manually create `.env` file and add environment variables:
```env
# API Configuration
VITE_API_BASE_URL=https://api.skyprepaero.com/api/v1

# App Configuration
VITE_APP_NAME=SkyPrep Admin
VITE_APP_VERSION=1.0.0

# For local development, you can override the API URL:
# VITE_API_BASE_URL=http://localhost:5000/api/v1
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with sidebar
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── api.js             # API service functions
│   ├── axios.js           # Centralized axios configuration
│   └── utils.js           # Utility functions
├── config/
│   ├── env.js             # Environment configuration
│   └── README.md          # Configuration documentation
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   ├── Subjects.jsx        # Subject management
│   ├── SubjectForm.jsx     # Subject create/edit form
│   ├── Chapters.jsx        # Chapter management
│   ├── ChapterForm.jsx     # Chapter create/edit form
│   ├── Questions.jsx       # Question management
│   └── QuestionForm.jsx    # Question create/edit form
├── App.jsx                 # Main app component
├── main.jsx               # App entry point
└── index.css              # Global styles
```

## API Integration

The admin panel integrates with the Question System API using a centralized axios configuration. The API base URL is configured via environment variables.

### Centralized Axios Configuration

The project uses a centralized axios instance (`src/lib/axios.js`) with the following features:

- **Environment-based configuration**: API URL loaded from environment variables
- **Request/Response interceptors**: Automatic token management and error handling
- **Error handling**: Centralized error handling with user-friendly toast notifications
- **Request logging**: Development-only logging for debugging
- **Retry logic**: Automatic retry for network errors
- **Timeout configuration**: 10-second timeout for all requests

### API Endpoints Used

- **Subjects**: `/api/v1/subjects`
- **Chapters**: `/api/v1/chapters`
- **Questions**: `/api/v1/questions`
- **Options**: `/api/v1/options`

### Environment Configuration

The API base URL is configured in the environment file:

```env
# Production API
VITE_API_BASE_URL=https://api.skyprepaero.com/api/v1

# Development API (override for local development)
# VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Features Overview

### Dashboard
- Overview statistics
- Quick action buttons
- Recent activity feed

### Subject Management
- Create, edit, delete subjects
- Soft delete with restore functionality
- Search and filter subjects
- Pagination support

### Chapter Management
- Create chapters within subjects
- Subject-based filtering
- Order management
- Soft delete support

### Question Management
- Create multiple choice questions
- Add 2-4 options per question
- Difficulty levels (Easy, Medium, Hard)
- Marks assignment
- Chapter and subject filtering
- Advanced search functionality

## Development

### Available Scripts

- `npm run setup` - Set up environment configuration
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint for code linting. Make sure to follow the configured rules.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Deployment

### Vercel Deployment

The project is configured for easy deployment on Vercel:

1. **Build Configuration**: The project builds to a `build` directory (configured in `vite.config.js`)
2. **Vercel Configuration**: `vercel.json` is included with proper settings
3. **Environment Variables**: Set in Vercel dashboard or via CLI

#### Deploy to Vercel

1. **Via Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Via Vercel Dashboard**:
   - Connect your GitHub repository
   - Vercel will automatically detect the Vite framework
   - Set environment variables in the dashboard

#### Environment Variables for Production

Set these in your Vercel dashboard:

```env
VITE_API_BASE_URL=https://api.skyprepaero.com/api/v1
VITE_APP_NAME=SkyPrep Admin
VITE_APP_VERSION=1.0.0
```

### Build Optimization

The build includes several optimizations:

- **Code Splitting**: Vendor, router, and UI libraries are split into separate chunks
- **Minification**: Terser minification for smaller bundle sizes
- **Tree Shaking**: Unused code is automatically removed
- **Asset Optimization**: CSS and JS assets are optimized and compressed

### Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Support

For support or questions, please contact the development team.
