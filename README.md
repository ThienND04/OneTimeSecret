# One Time Secret

[![Tests](https://github.com/ThienND04/OneTimeSecret/actions/workflows/test.yml/badge.svg)](https://github.com/ThienND04/OneTimeSecret/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/ThienND04/OneTimeSecret/branch/master/graph/badge.svg)](https://codecov.io/gh/ThienND04/OneTimeSecret)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

One Time Secret is an API that allows users to securely share sensitive information, such as passwords or private messages, that can only be accessed once.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)
- [License](#license)

## Features

- Create one-time readable secrets
- Secrets are deleted after being accessed
- Rate limiting and input validation
- Optional file attachments (stored on Cloudinary)
- Automatic cleanup files in readed secrets with scheduled jobs
- Swagger-based API documentation

## ⚙️ Tech Stack

| Layer         | Library/Tool                     |
|--------------|----------------------------------|
| Web Server    | [Express 5](https://expressjs.com/)             |
| Database      | [MongoDB + Mongoose](https://mongoosejs.com/)   |
| File Uploads  | [Multer + Cloudinary](https://cloudinary.com/)  |
| Security      | bcrypt, uuid, crypto-js, rate-limiter           |
| Docs          | Swagger UI, swagger-jsdoc, YAMLJS               |
| Validation    | [Zod](https://zod.dev/)                         |
| Scheduler     | [node-cron](https://www.npmjs.com/package/node-cron) |


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

### 3. Set Up Environment Variables
Create a .env file in the root directory and configure it as follows:
```bash
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/secretdb
    BCRYPT_SALT_ROUNDS=7
    SECRET_KEY=jcsdjfbshbfs
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
```
### 4. Run the server 
```bash
    npm start
```
    Server run at http://localhost:PORT. 

## Api documentation
This project uses Swagger for interactive API documentation.
- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

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
tests/
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

##  Security Notes
- Secrets are encrypted using crypto-js before storage.
- Passwords and tokens are hashed with bcrypt.
- Read-once logic ensures no secret can be accessed twice.
- Rate limiting is enforced per IP to prevent abuse.
- File uploads are handled securely via Cloudinary and Multer.

## Scripts
| Script                    | Description                           |
| ------------------------- | ------------------------------------- |
| `npm run dev`            | Start server with hot reload          |
| `npm start`              | Start server in production mode       |
| `npm test`               | Run all tests (unit + integration)    |
| `npm run test:unit`      | Run unit tests only                   |
| `npm run test:integration` | Run integration tests only          |

## Author
Nguyen Duc Thien
Github: https://github.com/ThienND04
