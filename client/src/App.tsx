import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import CreateSecretPage from './pages/CreateSecretPage';
import ViewSecretPage from './pages/ViewSecretPage';
import NotFoundPage from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { MySecretsPage } from './pages/MySecretsPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import './App.css';

// No need to setup token getter anymore, tokens are in httpOnly cookies

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
                        <Route
                            path="/change-password"
                            element={<ChangePasswordPage />}
                        />
                        <Route path="/my-secrets" element={<MySecretsPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
