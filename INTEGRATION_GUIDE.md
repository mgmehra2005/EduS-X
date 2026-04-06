# EduS-X Backend + Frontend Integration Guide

## Overview

This guide explains how the EduS-X backend and frontend are properly connected and synchronized. The application uses Flask for the backend API, React with Vite for the frontend, and MySQL for data persistence.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Frontend (Port 3000)                      │   │
│  │  - Built with Vite                              │   │
│  │  - Responsive CSS with modern styling           │   │
│  │  - React Router for navigation                  │   │
│  └──────────────────────────────────────────────────┘   │
│          │                                                │
│          │ HTTP/HTTPS                                     │
│          ▼                                                │
└─────────────────────────────────────────────────────────┘
          │
          │ API Calls
          ▼
┌─────────────────────────────────────────────────────────┐
│                  Docker Network                          │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ Frontend         │  │ Backend Flask    │              │
│  │ (nginx:3000)     │  │ (Port 5000)      │              │
│  │                  │  │                  │              │
│  │ nginx proxy      │──│ API Endpoints    │              │
│  │ for /api         │  │ - /api/query     │              │
│  │ /query-router    │  │ - /api/auth/*    │              │
│  │ /static          │  │ - /api/exercises │              │
│  └──────────────────┘  └─────────┬────────┘              │
│                                   │                      │
│                                   ▼                      │
│                        ┌──────────────────┐              │
│                        │  MySQL           │              │
│                        │  Database        │              │
│                        │  (Port 3306)     │              │
│                        └──────────────────┘              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Backend & Frontend Connection

### Backend API Endpoints

The backend provides RESTful API endpoints with JWT authentication:

#### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/logout` - User logout (requires token)
- **GET** `/api/auth/tokens` - List user tokens (requires token)

#### AI Query Processing
- **POST** `/api/query` - Submit a query for AI processing (requires token)
  - Request: `{ "query": "problem statement" }`
  - Response: `{ "source": "ai|cache", "data": {...} }`
- **POST** `/query-router` - Alias endpoint for backward compatibility

#### Exercises
- **GET** `/api/exercises` - Get exercises by concept (requires token)
  - Query params: `?concept_id=<id>`
- **POST** `/api/submit-answers` - Submit exercise answers (requires token)

#### Health Check
- **GET** `/api/health` - Health status of backend

### Frontend API Client

The frontend uses axios to communicate with the backend. Configuration is in `frontend/src/utils/api.js`:

```javascript
// API functions available:
- aiQuery(payload)        // POST /api/query
- loginApi(credentials)   // POST /api/auth/login
- registerApi(userData)   // POST /api/auth/register
- logoutApi()            // POST /api/auth/logout
- getExercises(conceptId) // GET /api/exercises
- submitAnswers(data)     // POST /api/submit-answers
```

**Key features:**
- Automatic Authorization header handling with JWT tokens
- Base URL configuration for both development and production
- Consistent error handling
- localStorage integration for token persistence

## Docker Compose Setup

### Services

**Database (MySQL 8.0)**
- Container name: `edusx_db`
- Host: `db` (internal Docker network)
- Port: 3306
- Environment: 
  - `MYSQL_DATABASE`: eduba
  - `MYSQL_ROOT_PASSWORD`: rootpassword

**Backend (Flask)**
- Container name: `edusx_backend`
- Host: `backend` (internal Docker network)
- Port: 5000
- Environment:
  - `DB_HOST`: db (internal address)
  - `FLASK_ENV`: production
  - `SECRET_KEY`: changeme (change in production!)

**Frontend (React + Nginx)**
- Container name: `edusx_frontend`
- Host: localhost
- Port: 3000
- Nginx proxy configuration:
  - `/api/*` → backend:5000/api/*
  - `/query-router` → backend:5000/query-router
  - `/static/*` → backend:5000/static/*
  - `/` → React SPA with fallback to index.html

### Network Communication

All services communicate through the `edusx_network` bridge network:
- Frontend connects to backend using: `http://backend:5000`
- Backend connects to database using: `h://db:3306`
- External clients access frontend at: `http://localhost:3000`

## CSS Styling

### CSS Architecture

The application uses a single `frontend/src/styles.css` file with:

**Component Styling:**
- Clean, modern design with professional color scheme
- Responsive grid layout for multi-pane views
- Proper spacing with CSS variables and utilities
- Form elements with focus states and validation feedback

**Key Classes:**
- `.panes` - Grid layout for solution display
- `.pane` - Individual content sections
- `.error` / `.success` / `.loading` - Status messages
- Utility classes: `.mt-*`, `.mb-*`, `.p-*` for spacing

**Responsive Design:**
- Mobile-first approach
- Breakpoints at 768px for tablet/mobile
- Flexible grid with `auto-fit` columns
- Touch-friendly button sizes

### CSS Features

1. **Global Styles**
   - System font stack with fallbacks
   - Smooth antialiasing
   - Full viewport height for layout

2. **Form Styling**
   - Consistent input appearance
   - Focus states with visual feedback
   - Error/success message styling

3. **Layout Components**
   - Header with branding and navigation
   - Main content area with padding
   - Footer with copyright info
   - Flexible pane layout for content organization

4. **Interactive Elements**
   - Hover states for buttons and links
   - Disabled button styling
   - Box shadows for depth
   - Border radius for modern appearance

## Frontend Pages

### Navigation Structure

```
/                    → Home page (query submission)
/login               → Login form
/register            → Registration form
/solution            → Solution display page
```

### Page Functions

**Home** (`pages/Home.jsx`)
- Query submission form
- Authentication check
- Redirects to login if not authenticated
- Displays AI solution results in Solution page

**Login** (`pages/Login.jsx`)
- Email/password form
- JWT token storage in localStorage
- Automatic Authorization header setup
- Redirects to home on successful login

**Register** (`pages/Register.jsx`)
- User registration form
- Name, email, password fields
- Form validation
- Redirects to login on successful registration

**Solution** (`pages/Solution.jsx`)
- Displays AI-generated solution
- Three-pane layout:
  1. Problem statement (left)
  2. Solution and explanation (center)
  3. Concept and difficulty info (right)
- Parses complex JSON responses
- Back button for navigation

## Development vs Production

### Local Development

```bash
# Install dependencies
cd backend && pip install -r requirements.txt
cd frontend && npm install

# Run locally (port 5000 for backend, 3000 for frontend)
# Vite proxy configured for /api and /query-router routes
```

### Docker Production

```bash
# Build and run
docker-compose build
docker-compose up

# Services communicate via internal network
# Frontend accessible at http://localhost:3000
# Backend accessible internally at http://backend:5000
```

**Key differences:**
- Development: Vite proxy handles routing
- Production: Nginx proxy and compiled React bundle
- Database connection: localhost (dev) vs db (Docker)
- CORS handling: Dynamic origins based on environment

## Request Flow Example

### Query Submission Flow

```
1. User enters problem statement on Home page
   ↓
2. Frontend validates input and checks authentication
   ↓
3. Frontend sends: POST /api/query with Bearer token
   {"query": "problem statement"}
   ↓
4. nginx proxies request to backend:5000
   ↓
5. Flask backend receives request with JWT token
   ↓
6. Backend validates token, checks cache for existing solution
   ↓
7. If not cached:
   - Calls EdubaAIEngine to generate solution
   - Stores in ai_cache table
   ↓
8. Backend returns JSON response
   {
     "source": "ai|cache",
     "data": {
       "final_answer": "...",
       "stepwise_explanation": [...],
       "concept": "...",
       "difficulty": "..."
     }
   }
   ↓
9. nginx proxies response back to frontend
   ↓
10. Frontend stores response in sessionStorage
    ↓
11. Frontend navigates to Solution page
    ↓
12. Solution page renders data from sessionStorage
```

## Common Issues & Troubleshooting

### "Cannot POST /api/query"
- **Cause**: Backend not running or wrong port
- **Solution**: Verify backend is running on port 5000, check docker logs

### "401 Unauthorized"
- **Cause**: JWT token invalid or expired
- **Solution**: Clear localStorage and re-login

### "Cannot reach backend from frontend (in Docker)"
- **Cause**: Using localhost instead of service name
- **Solution**: Always use `http://backend:5000` in Docker containers

### "CSS not applying"
- **Cause**: CSS not imported in main.jsx
- **Solution**: Verify `import './styles.css'` in frontend/src/main.jsx

### "CORS errors"
- **Cause**: Frontend origin not in CORS_ALLOWED_ORIGINS
- **Solution**: Backend CORS configured for localhost:3000 and localhost:5000

## Security Notes

1. **JWT Tokens**
   - Stored in browser localStorage (consider httpOnly cookies for production)
   - Sent in Authorization header as Bearer token
   - Token validation on backend for protected routes

2. **Database**
   - Use proper parameterized queries (using %s placeholders)
   - Never use string interpolation for SQL queries

3. **CORS**
   - Configured with specific origins
   - Credentials support enabled
   - Can be customized via CORS_ALLOWED_ORIGINS env variable

4. **Secrets**
   - SECRET_KEY should be unique per environment
   - Use environment variables for sensitive data
   - Never commit secrets to version control

## API Response Examples

### Successful Query Response
```json
{
  "source": "ai",
  "data": {
    "user_query": "How to solve quadratic equations?",
    "final_answer": "x = (-b ± √(b²-4ac)) / 2a",
    "stepwise_explanation": ["Step 1...", "Step 2...", "Step 3..."],
    "concept": "Quadratic Equations",
    "difficulty": "Intermediate",
    "related_concepts": ["Algebra", "Polynomial"]
  }
}
```

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1,
  "email": "user@example.com"
}
```

### Error Response
```json
{
  "error": "Invalid email or password"
}
```

## Next Steps

1. **Add more tests** for API endpoints
2. **Implement rate limiting** on API endpoints
3. **Add analytics** to track usage
4. **Optimize images** for logo and static assets
5. **Set up CI/CD** pipeline for automated deployment
6. **Add logging** for debugging in production

---

**Last Updated**: 2025-04-06
