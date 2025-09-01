# Setup Guide

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10, macOS 10.14, Ubuntu 18.04 | Latest versions |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 500MB | 1GB+ |
| **Node.js** | 18+ | Latest LTS |
| **Resolution** | 1024x768 | 1920x1080+ |

## Installation

### Quick Start (Demo)
```bash
# Clone repository
git clone https://github.com/danielmares32/JulioEPA.git
cd JulioEPA

# Install dependencies
npm install

# Run complete demo with UAA data
npm run demo
```

### Development Setup
```bash
# Development mode (requires backend)
npm run dev

# Build for production
npm run build

# Create installers
npm run dist        # Current platform
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

### Environment Configuration

Create `.env` file based on `.env.example`:
```env
NODE_ENV=development
API_URL=https://api.uaa.edu.mx
ELECTRON_DEV_TOOLS=true
DATABASE_URL=postgresql://user:pass@localhost:5432/aulavirtual
```

### Backend Setup (Optional)

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Configure PostgreSQL connection in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/aulavirtual

# Run database migrations
npm run migrate

# Seed with demo data
npm run seed

# Start backend server
npm run dev
```

## Demo Features

### Complete Demo Environment
- **10 realistic courses** including Programming, AI, Calculus, Web Development
- **Demo user**: Carlos Martínez (student)
- **Flexible login**: Any email@edu.uaa.mx with any password
- **Pre-loaded cart** with 3 courses totaling $6,100 MXN
- **Progress tracking** (85% Programming, 65% Calculus)
- **5 notifications** and 8 recent activities

### Demo Data Includes
- Course catalog with UAA institutional content
- Student dashboard with realistic metrics
- Shopping cart functionality
- Progress tracking and notifications
- Complete offline functionality

## Troubleshooting

### Common Issues

1. **better-sqlite3 compilation errors**
   ```bash
   npm run rebuild
   ```

2. **Missing main process**
   ```bash
   npm run build:main
   ```

3. **Port 3000 occupied**
   ```bash
   # Kill process or change port
   lsof -ti:3000 | xargs kill -9
   ```

4. **White screen on startup**
   - Check build process completed
   - Verify file permissions
   - Check console for errors

### Development Commands
```bash
npm run rebuild     # Rebuild native modules
npm run lint        # Code quality check
npm run typecheck   # TypeScript validation
npm test           # Run test suite (when implemented)
```

### Database Issues

**SQLite (Local)**
- Database location: `~/AppData/Roaming/aula-virtual-desktop/`
- Reset: Delete database file and restart app
- WAL mode enabled for better performance

**PostgreSQL (Server)**
- Check connection string in `.env`
- Ensure PostgreSQL server is running
- Run migrations: `npm run migrate`
- Reset: `npm run reset-db`