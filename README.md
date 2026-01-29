# One Time Secret

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

### Secret Sharing

- **One-time access**: Secrets are automatically deleted after being viewed
- **Password protection**: Optional password requirement for additional security
- **File attachments**: Upload up to 3 files with each secret
- **Custom titles**: Organize secrets with descriptive titles
- **Auto-cleanup**: Automated removal of expired secrets and associated files

### User Management

- **User authentication**: Secure registration and login with JWT
- **Session management**: HttpOnly cookies for secure token storage
- **Password reset**: Email-based password recovery flow
- **Change password**: Update password while logged in
- **My Secrets**: View and manage all your created secrets
- **Secret statistics**: Track viewed, unviewed, and revoked secrets

### Security Features

- Rate limiting and input validation
- Bcrypt password hashing
- AES-256 content encryption
- CORS configuration
- Secure cookie settings (httpOnly, sameSite, secure)
- Request sanitization

### User Experience

- Modern, responsive React UI with Tailwind CSS
- Real-time feedback and error handling
- Loading states and skeleton screens
- Dark mode interface
- Mobile-friendly design

## Tech Stack

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

## Security Notes

- Secrets are encrypted using crypto-js before storage.
- Passwords and tokens are hashed with bcrypt.
- Read-once logic ensures no secret can be accessed twice.
- Rate limiting is enforced per IP to prevent abuse.
- File uploads are handled securely via Cloudinary and Multer.

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start backend server with hot reload |
| `npm run dev:client` | Start frontend development server    |
| `npm run dev:all`    | Start both backend and frontend      |
| `npm start`          | Start backend in production mode     |
| `npm run build`      | Build frontend for production        |
| `npm run format`     | Format code with Prettier            |

## Author

Nguyen Duc Thien
Github: https://github.com/ThienND04
