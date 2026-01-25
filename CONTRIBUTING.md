# Contributing to OneTimeSecret

Thank you for your interest in contributing to OneTimeSecret! 🎉

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/ThienND04/OneTimeSecret.git
   cd OneTimeSecret
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment files**:
   - Copy `.env.development`, `.env.test`, `.env.production` from docs
   - Update with your local configuration

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation if needed

### 3. Write Tests

All code changes should include tests:

```bash
# Run tests while developing
npm test -- --watch

# Run specific test file
npm test -- path/to/test.test.js

# Check test coverage
npm test -- --coverage
```

**Test Requirements:**
- ✅ New features must have unit tests
- ✅ Bug fixes must include regression tests
- ✅ Integration tests for API endpoints
- ✅ All tests must pass before submitting PR

### 4. Run Tests Locally

Before committing, ensure all tests pass:

```bash
# Run all tests
npm test

# Run linting (if configured)
npm run lint

# Check code formatting (if configured)
npm run format
```

### 5. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add password strength validation"
# or
git commit -m "fix: resolve MongoDB connection timeout"
```

Commit message format:
```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Test additions/updates
- `chore` - Build/tooling changes

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template completely
5. Link related issues
6. Wait for CI/CD checks to pass
7. Request review if needed

## Pull Request Guidelines

### Before Submitting

- ✅ All tests pass (`npm test`)
- ✅ Code follows project style
- ✅ Commits are clean and well-described
- ✅ Documentation is updated
- ✅ No merge conflicts with master

### PR Requirements

1. **Descriptive Title**: Clear summary of changes
2. **Detailed Description**: What, why, and how
3. **Test Evidence**: Proof that tests pass
4. **Screenshots**: If UI changes
5. **Breaking Changes**: Clearly documented
6. **Issue Links**: Reference related issues

### Review Process

1. **Automated Checks**: CI/CD must pass (required)
   - All tests pass on Node 18.x and 20.x
   - MongoDB integration tests pass
   
2. **Code Review**: Wait for maintainer review
   - Address review comments promptly
   - Update PR based on feedback
   
3. **Approval**: PR approved by maintainer
   
4. **Merge**: Maintainer will merge your PR

## Code Style

### JavaScript/Node.js

- Use ES6+ features
- Async/await over callbacks
- Descriptive variable names
- Keep functions small and focused
- Add JSDoc comments for functions

Example:
```javascript
/**
 * Encrypts text using AES encryption
 * @param {string} plainText - Text to encrypt
 * @returns {Object} Encrypted content and IV
 */
function encryptText(plainText) {
    // implementation
}
```

### Testing Style

- Descriptive test names
- One assertion per test (when possible)
- Use `beforeEach` for setup
- Clean up after tests

Example:
```javascript
describe('AuthService', () => {
    describe('loginUser', () => {
        test('should successfully login with valid credentials', async () => {
            // Arrange
            const email = 'test@example.com';
            const password = 'password123';
            
            // Act
            const result = await authService.loginUser(email, password);
            
            // Assert
            expect(result).toBeDefined();
            expect(result.user.email).toBe(email);
        });
    });
});
```

## Project Structure

```
OneTimeSecret/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── validators/     # Input validation schemas
├── tests/
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
├── docs/              # Documentation
└── .github/           # GitHub workflows and templates
```

## Environment Setup

### Required Environment Variables

See [ENVIRONMENT_CONFIG.md](docs/ENVIRONMENT_CONFIG.md) for complete details.

**Development:**
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/secretdb_dev
SECRET_KEY=your_dev_secret
# ... other variables
```

**Test:**
```env
NODE_ENV=test
PORT=3001
MONGO_URI=mongodb://localhost:27017/secretdb_test
BCRYPT_SALT_ROUNDS=4  # Faster for tests
# ... other variables
```

## Testing Guidelines

### Writing Unit Tests

- Test one unit of functionality
- Mock external dependencies
- Test edge cases and error conditions

### Writing Integration Tests

- Test full request/response cycle
- Use real MongoDB (test database)
- Clean up test data after each test
- Test authentication flows

### Test Coverage

Aim for:
- **Unit tests**: 80%+ coverage
- **Integration tests**: Critical paths covered
- **Edge cases**: Error handling tested

Check coverage:
```bash
npm test -- --coverage
```

## Need Help?

- 📖 Read the [documentation](docs/)
- 💬 Open an issue for questions
- 🐛 Report bugs via GitHub issues
- 💡 Suggest features via GitHub issues

## Code of Conduct

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- README acknowledgments (for major features)

Thank you for contributing! 🙏
