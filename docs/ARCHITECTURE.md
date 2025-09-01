# Architecture Documentation

## Project Overview

**Julio** is "Aula Virtual 2.0" - a desktop educational platform developed for Universidad Autónoma de Aguascalientes (UAA). It's an offline-first learning management system built as an Electron application for cross-platform desktop deployment.

## Technology Stack

### Frontend Technologies
- **Electron 37.3.1** - Cross-platform desktop app framework
- **React 19.1.1** - UI component library
- **TypeScript 5.9.2** - Type-safe JavaScript
- **Vite 7.1.3** - Build tool and development server
- **React Router 7.8.2** - Client-side routing
- **Zustand 5.0.8** - State management
- **TanStack React Query 5.85.5** - Server state management

### Backend Technologies
- **Node.js** with **Express 4.18.2** - REST API server
- **PostgreSQL** - Primary database (with **pg 8.11.3** driver)
- **Better SQLite3 12.2.0** - Local/offline database
- **JWT** - Authentication tokens
- **bcrypt/bcryptjs** - Password hashing

## Project Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts            # Main Electron entry point
│   ├── preload.ts          # Context bridge & seed data
│   └── windows/            # Window management
├── renderer/               # React frontend application
│   ├── components/         # React components
│   ├── pages/             # Route pages
│   ├── store/             # Zustand state stores
│   ├── services/          # API & business logic
│   └── styles/            # CSS stylesheets
├── shared/                # Shared types & constants
│   ├── types/             # TypeScript interfaces
│   └── constants/         # App constants
└── backend/               # Express API server
    ├── src/
    │   ├── controllers/   # Route handlers
    │   ├── routes/        # API route definitions
    │   └── middleware/    # Express middleware
    └── uploads/           # File storage
```

## Application Architecture

### Multi-Process Electron Architecture
- **Main Process**: Manages application lifecycle, window creation
- **Renderer Process**: React application running in Chromium
- **Preload Script**: Secure communication bridge with demo data

### Hybrid Data Strategy
- **Online Mode**: Express API server with PostgreSQL database
- **Offline Mode**: Better SQLite3 with preloaded demo data
- **Demo Mode**: Mock data embedded in preload script

### Communication Flow
```
React Components
    ↓
Zustand Stores (Local State)
    ↓
React Query (Server State)
    ↓
API Service Layer
    ↓
Express REST API
    ↓
PostgreSQL/SQLite Database
```

## Key Design Patterns

1. **Repository Pattern**: API service layer abstracts data access
2. **Observer Pattern**: Zustand state management with subscriptions
3. **Facade Pattern**: API client provides simplified interface
4. **Strategy Pattern**: Theme switching and offline/online modes
5. **Command Pattern**: IPC communication between processes

## Offline-First Strategy

- SQLite database stores downloaded course content
- Service workers cache API responses
- Automatic synchronization when online
- Demo data embedded for instant functionality
- Optimistic updates for better UX