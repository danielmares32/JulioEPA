# Development Setup Guide

## 🎯 Current Working Configuration

This document contains the exact setup instructions that result in a working Aula Virtual 2.0 development environment.

### ✅ Verified Working Setup

**Last Verified**: September 2025  
**Environment**: macOS with PostgreSQL 14+, Node.js 18+

## 📋 Prerequisites

1. **Node.js** 18 or higher
2. **PostgreSQL** 14 or higher
3. **Git**
4. **npm** (comes with Node.js)

## 🚀 Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/danielmares32/JulioEPA.git
cd JulioEPA

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Configuration

```bash
# Create PostgreSQL database
createdb aula_virtual

# Setup backend environment
cd backend
cp .env.example .env
```

Edit `backend/.env` with these **exact values**:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aula_virtual
DB_USER=postgres
DB_PASSWORD=Xuinos98

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip,.rar

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 3. Launch Application

**Terminal 1**: Start Backend
```bash
cd backend
npm run dev
```

Wait for: `🚀 Aula Virtual Backend running on port 3001`

**Terminal 2**: Start Frontend
```bash
# From project root
NODE_ENV=development npm run dev
```

Wait for: `🚀 Aplicación lista - Aula Virtual 2.0`

## 🔐 Access Information

### Application Access
- **Desktop App**: Opens automatically
- **Web Browser**: http://localhost:3000
- **API Base**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

### Login Credentials
- **Email**: `admin@uaa.mx`
- **Password**: `password123`

### Theme
- **Navy Blue Theme**: #1E3A8A (automatically applied)
- Located in: `src/renderer/styles/globals.css`

## 🛠️ Development Commands

### Frontend Commands
```bash
# Development mode (Electron + React)
NODE_ENV=development npm run dev

# Build main process
npm run build:main

# Build renderer (React)
npm run dev:renderer

# Start Electron only
npm run dev:electron
```

### Backend Commands
```bash
cd backend

# Development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Production server
npm start

# Database operations
npm run migrate
npm run seed
```

## 🔍 Troubleshooting

### Port Conflicts
If ports 3000 or 3001 are in use:
```bash
# Kill processes on ports
lsof -ti:3000,3001 | xargs kill -9
```

### Database Connection Issues
1. Verify PostgreSQL is running: `brew services start postgresql`
2. Check database exists: `psql -l | grep aula_virtual`
3. Test connection: `psql -d aula_virtual -U postgres`

### Theme Issues
If light blue appears instead of navy:
- Check `src/renderer/styles/globals.css` line 8: `--color-primary: #1E3A8A !important;`

### TypeScript Errors
Common fixes:
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure

```
JulioEPA/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Main Electron entry
│   │   └── preload.ts  # IPC bridge (production)
│   └── renderer/       # React frontend
│       └── styles/     # CSS with navy theme
├── backend/            # Express.js API
│   ├── src/
│   │   ├── server.ts   # Main server
│   │   └── routes/     # API endpoints
│   └── .env            # Database config
├── package.json        # Frontend dependencies
└── README.md          # Main documentation
```

## 🔄 Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `NODE_ENV=development npm run dev`  
3. **Make Changes**: Edit files with hot reload
4. **Test**: Use Electron app or http://localhost:3000
5. **Commit**: Standard git workflow

## ⚡ Quick Demo Mode

For testing without database setup:
```bash
npm run demo
```

This runs with mock data and no backend dependency.

## 📝 Notes

- **Demo files removed**: No longer interfere with production
- **Navy theme enforced**: Uses `!important` declarations
- **Electron preload**: Clean production version without demo data
- **Database**: PostgreSQL with specific password "Xuinos98"
- **Ports**: Backend on 3001, Frontend on 3000 (not 5173)