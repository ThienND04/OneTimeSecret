# OneTimeSecret Client

Frontend application for OneTimeSecret - a secure message sharing platform.

## 🚀 Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.18
- **Linting**: ESLint 9

## 📁 Project Structure

```
client/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── common/      # Generic UI components (Button, Input, etc.)
│   │   └── features/    # Feature-specific components
│   ├── pages/           # Page components
│   ├── layouts/         # Layout components
│   ├── services/        # API service layer
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   ├── App.css          # App-specific styles
│   ├── index.css        # Global styles with Tailwind imports
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment variables template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🛠️ Development

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
# From the root of the monorepo
npm install

# Or install client dependencies only
npm install --workspace=client
```

### Environment Variables

Create a `.env` file in the `client/` directory:

```bash
VITE_API_URL=http://localhost:3000
```

**Note**: All Vite environment variables must be prefixed with `VITE_`.

### Running the Development Server

```bash
# From the root of the monorepo
npm run dev:client

# Or from the client directory
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
# From the root of the monorepo
npm run build --workspace=client

# Or from the client directory
cd client
npm run build
```

The production build will be created in the `client/dist/` directory.

### Preview Production Build

```bash
cd client
npm run preview
```

## 🔌 API Integration

The client communicates with the backend API through:

1. **Development Proxy**: Vite dev server proxies `/api/*` requests to the backend
2. **Environment Variable**: `VITE_API_URL` configures the backend URL
3. **API Service Layer**: `src/services/api.ts` handles all API calls

### Example API Call

```typescript
import { apiService } from './services/api';

// Create a secret
const response = await apiService.createSecret({
  content: 'My secret message',
  password: 'optional-password',
  isEncrypted: false,
});

// Get a secret
const secret = await apiService.getSecret('secret-id', 'password');
```

## 🎨 Styling

This project uses **Tailwind CSS 4** with the new Vite plugin:

- Configuration: `@import "tailwindcss"` in `src/index.css`
- Custom styles: Add to `src/App.css` or component-specific CSS files
- Utility classes: Use Tailwind's utility-first approach

## 📦 Scripts

| Script      | Description                               |
| ----------- | ----------------------------------------- |
| `dev`       | Start development server (port 5173)      |
| `build`     | Build for production                      |
| `lint`      | Run ESLint                                |
| `preview`   | Preview production build locally          |

## 🔧 Configuration Files

### `vite.config.ts`

- Configures Vite plugins (React, Tailwind)
- Sets up development server with API proxy
- Loads environment variables

### `tsconfig.json`

TypeScript configuration for type checking and compilation.

### `eslint.config.js`

ESLint configuration for code quality and consistency.

## 🌐 Deployment

### Option 1: Deploy with Backend

Build the frontend and serve static files from the Express backend:

```bash
npm run build --workspace=client
```

Then configure Express to serve `client/dist/`:

```javascript
app.use(express.static(path.join(__dirname, '../../client/dist')));
```

### Option 2: Deploy Separately

Deploy frontend to platforms like Vercel, Netlify, or Cloudflare Pages:

1. Update `VITE_API_URL` to your production API URL
2. Connect your Git repository
3. Set build command: `npm run build`
4. Set output directory: `dist`

**Example for Vercel:**

```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://api.yourdomain.com"
  }
}
```

## 🔐 Security Notes

- API keys and secrets should never be committed
- Always use `VITE_` prefix for environment variables
- Backend API handles authentication and authorization
- Client-side encryption is supported for sensitive data

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

ISC

---

**Part of the OneTimeSecret monorepo**  
**Maintainer**: ThienND04
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
