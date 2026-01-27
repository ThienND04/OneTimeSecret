import { ThemeProvider } from './contexts/ThemeContext'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  )
}

export default App
