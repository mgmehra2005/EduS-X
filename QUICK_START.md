# Quick Start Guide - EduS-X

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

---

## Quick Start (Docker - Recommended)

### 1. Build and Start Services
```bash
cd EduS-X
docker-compose build
docker-compose up
```

### 2. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

### 3. Test the Integration
1. Visit http://localhost:3000
2. Click "Sign up" to create an account
3. Fill in your details and register
4. Login with your credentials
5. Enter a problem statement (e.g., "How to solve quadratic equations?")
6. Click "Get Solution"
7. View the solution with proper styling

### 4. View Logs
```bash
# View all services
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Stop Services
```bash
docker-compose down
```

---

## Local Development Setup

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python run.py
```

Backend will be available at: http://localhost:5000

### Frontend Setup (in another terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## Project Structure

```
EduS-X/
├── backend/                    # Flask API server
│   ├── app/
│   │   ├── __init__.py        # Flask app setup with CORS
│   │   ├── routes.py          # API endpoints
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── db_connect.py      # Database connection
│   │   ├── jwt_utils.py       # JWT token handling
│   │   ├── eduba_engine.py    # AI engine
│   │   └── db_migrations/     # SQL migration files
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py                 # Entry point
│
├── frontend/                   # React Vite app
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx       # Query submission
│   │   │   ├── Login.jsx      # Login form
│   │   │   ├── Register.jsx   # Registration form
│   │   │   └── Solution.jsx   # Solution display
│   │   ├── components/        # Reusable components
│   │   ├── utils/
│   │   │   └── api.js         # API client
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # React entry point
│   │   └── styles.css         # Global styles
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
│
├── docker-compose.yml         # Services orchestration
├── INTEGRATION_GUIDE.md       # Detailed integration docs
├── CHANGES_SUMMARY.md         # All changes made
└── README.md
```

---

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout (requires token)
GET /api/auth/tokens (requires token)
```

### AI Queries
```
POST /api/query (requires token)
  Request: { "query": "your question" }
  Response: { "source": "ai|cache", "data": {...} }
```

### Exercises
```
GET /api/exercises?concept_id=1 (requires token)
POST /api/submit-answers (requires token)
```

### Health
```
GET /api/health
```

---

## Environment Variables

### Backend (docker-compose.yml or .env)
```
DB_HOST=db
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=eduba
SECRET_KEY=changeme
FLASK_ENV=production
```

### Frontend (docker-compose.yml)
```
VITE_BACKEND_URL=http://backend:5000
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:**
- Make sure all containers are running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify port 5000 is not in use locally

### Issue: "401 Unauthorized"
**Solution:**
- Clear localStorage: open DevTools → Application → localStorage → Clear All
- Log out and log back in

### Issue: "CSS not loading"
**Solution:**
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache

### Issue: "Database connection error"
**Solution:**
- Check MySQL is running: `docker-compose ps db`
- Wait a few seconds for MySQL to start
- Check database logs: `docker-compose logs db`

---

## Frontend Features

✅ **Responsive Design**
- Mobile-friendly layout
- Adapts to different screen sizes
- Touch-friendly buttons

✅ **User Authentication**
- JWT token-based authentication
- Secure login/registration
- Token persistence in localStorage

✅ **AI Query Processing**
- Submit problem statements
- Receive personalized solutions
- View step-by-step explanations
- Cache results for fast retrieval

✅ **Professional UI**
- Consistent styling
- Error messages
- Loading states
- Navigation between pages

---

## Backend Features

✅ **REST API**
- JSON request/response format
- Proper HTTP status codes
- CORS enabled for frontend

✅ **Security**
- JWT token validation
- SQL parameterized queries
- CORS protection

✅ **Database**
- MySQL integration
- User management
- Query caching
- Exercise tracking

---

## Troubleshooting Checklist

Before reporting issues, check:
- [ ] Docker is running
- [ ] All containers are up: `docker-compose ps`
- [ ] Port 3000 is accessible
- [ ] Browser is not cached (hard refresh)
- [ ] Database has started (wait 10-15 seconds)
- [ ] Backend logs don't show errors: `docker-compose logs backend`
- [ ] Frontend console doesn't show errors (DevTools → Console)

---

## Deployment Checklist

Before going to production:
- [ ] Change SECRET_KEY to a secure random value
- [ ] Update database password (not "rootpassword")
- [ ] Configure CORS_ALLOWED_ORIGINS for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper logging
- [ ] Set up database backups
- [ ] Set up monitoring and alerts
- [ ] Load test the application
- [ ] Create runbook for operations team

---

## For More Information

- **Integration Details**: See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **Changes Made**: See [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)
- **Backend README**: See [backend/README.md](backend/README.md)
- **Frontend README**: See [frontend/README.md](frontend/README.md)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the integration guide
3. Check application logs
4. Verify all services are running

---

**Last Updated**: 2025-04-06
