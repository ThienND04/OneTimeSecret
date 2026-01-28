import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import CreateSecretPage from './pages/CreateSecretPage';
import ViewSecretPage from './pages/ViewSecretPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/create" element={<CreateSecretPage />} />
                    <Route path="/secret/:id" element={<ViewSecretPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
