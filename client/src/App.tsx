import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { apiService } from './services/api';
import HomePage from './pages/HomePage';
import CreateSecretPage from './pages/CreateSecretPage';
import ViewSecretPage from './pages/ViewSecretPage';
import NotFoundPage from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import './App.css';

// Setup auth token getter for API service
const getAuthToken = () => {
    try {
        const tokens = localStorage.getItem('auth_tokens');
        if (tokens) {
            const parsed = JSON.parse(tokens);
            return parsed.access?.token || null;
        }
    } catch (error) {
        console.error('Failed to get auth token:', error);
    }
    return null;
};

apiService.setAuthTokenGetter(getAuthToken);

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/create" element={<CreateSecretPage />} />
                        <Route
                            path="/secret/:id"
                            element={<ViewSecretPage />}
                        />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/forgot-password"
                            element={<ForgotPasswordPage />}
                        />
                        <Route
                            path="/reset-password"
                            element={<ResetPasswordPage />}
                        />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
