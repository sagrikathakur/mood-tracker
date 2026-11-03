import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WellnessProvider } from './context/WellnessContext'
import { Toaster } from 'react-hot-toast'

// Stable toast options reference to prevent React 19 re-render / dispatch loop
const TOAST_OPTIONS = {
  duration: 3500,
  style: {
    background: '#FCFAF4',
    color: '#0a1b10',
    border: '2px solid #0a1b10',
    boxShadow: '3px 3px 0px #0a1b10',
    borderRadius: '16px',
    fontWeight: '700',
    fontSize: '13px',
  },
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <WellnessProvider>
        <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
        <App />
      </WellnessProvider>
    </AuthProvider>
  </BrowserRouter>,
)
