import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WellnessProvider } from './context/WellnessContext'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <WellnessProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <App />
      </WellnessProvider>
    </AuthProvider>
  </BrowserRouter>,
)
