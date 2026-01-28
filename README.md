# One Time Secret

[![Tests](https://github.com/ThienND04/OneTimeSecret/actions/workflows/test.yml/badge.svg)](https://github.com/ThienND04/OneTimeSecret/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/ThienND04/OneTimeSecret/branch/master/graph/badge.svg)](https://codecov.io/gh/ThienND04/OneTimeSecret)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

One Time Secret is a full-stack application that allows users to securely share sensitive information, such as passwords or private messages, that can only be accessed once.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Security Notes](#security-notes)
- [License](#license)

## Features

- Create one-time readable secrets
- Secrets are deleted after being accessed
- Rate limiting and input validation
- Optional file attachments (stored on Cloudinary)
- Automatic cleanup files in readed secrets with scheduled jobs
- Swagger-based API documentation
- Modern React frontend with TypeScript

## ⚙️ Tech Stack

### Backend (server/)

| Layer        | Library/Tool                                         |
| ------------ | ---------------------------------------------------- |
| Web Server   | [Express 5](https://expressjs.com/)                  |
| Database     | [MongoDB + Mongoose](https://mongoosejs.com/)        |
| File Uploads | [Multer + Cloudinary](https://cloudinary.com/)       |
| Security     | bcrypt, uuid, crypto-js, rate-limiter                |
| Docs         | Swagger UI, swagger-jsdoc, YAMLJS                    |
| Validation   | [Zod](https://zod.dev/)                              |
| Scheduler    | [node-cron](https://www.npmjs.com/package/node-cron) |

### Frontend (client/)

| Layer      | Library/Tool                                  |
| ---------- | --------------------------------------------- |
| Framework  | [React 19](https://react.dev/)                |
| Build Tool | [Vite 7](https://vite.dev/)                   |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com/)    |
| Language   | [TypeScript](https://www.typescriptlang.org/) |

## Project Structure

This is a monorepo using npm workspaces:

```
OneTimeSecret/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── validators/    # Zod validation schemas
│   ├── tests/             # Unit & integration tests
│   └── package.json
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── ...
│   └── package.json
├── package.json           # Root workspace config
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ThienND04/OneTimeSecret.git
cd OneTimeSecret
```

### 2. Install dependencies

```bash
npm install
```

This will install dependencies for both server and client workspaces.

### 3. Set Up Environment Variables

Create a `.env.development` file in the `server/` directory:

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/secretdb_dev
BCRYPT_SALT_ROUNDS=7
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_DAYS=7
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Run the application

#### Development mode (backend only)

```bash
npm run dev
```

#### Development mode (frontend only)

```bash
npm run dev:client
```

#### Development mode (both)

```bash
npm run dev:all
```

- Backend API: http://localhost:3000
- Frontend: http://localhost:5173

## API Documentation

This project uses Swagger for interactive API documentation.

- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Testing

The project has comprehensive test coverage including unit tests and integration tests.

### Run Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
server/tests/
├── unit/                    # Unit tests
│   ├── middlewares/        # Middleware tests
│   ├── services/           # Service layer tests
│   ├── utils/              # Utility function tests
│   └── validators/         # Validation schema tests
└── integration/            # Integration tests
    ├── auth/              # Authentication API tests
    └── secret/            # Secret API tests
```

### CI/CD

- ✅ Automated tests run on every push and pull request
- ✅ MongoDB service automatically provisioned in CI
- ✅ Tests required to pass before merging to master
- ✅ Coverage reports generated automatically

See [CI/CD Setup Guide](docs/CI_CD_SETUP.md) for more details.

## Security Notes

- Secrets are encrypted using crypto-js before storage.
- Passwords and tokens are hashed with bcrypt.
- Read-once logic ensures no secret can be accessed twice.
- Rate limiting is enforced per IP to prevent abuse.
- File uploads are handled securely via Cloudinary and Multer.

## Scripts

| Script                     | Description                          |
| -------------------------- | ------------------------------------ |
| `npm run dev`              | Start backend server with hot reload |
| `npm run dev:client`       | Start frontend development server    |
| `npm run dev:all`          | Start both backend and frontend      |
| `npm start`                | Start backend in production mode     |
| `npm run build`            | Build frontend for production        |
| `npm test`                 | Run all tests (unit + integration)   |
| `npm run test:unit`        | Run unit tests only                  |
| `npm run test:integration` | Run integration tests only           |
| `npm run format`           | Format code with Prettier            |

## Author

Nguyen Duc Thien
Github: https://github.com/ThienND04

# Test prettier hook
