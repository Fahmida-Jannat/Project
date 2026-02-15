import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: 'rgba(15,16,32,0.95)',
          color: '#fff',
          fontWeight: '500',
          fontSize: '14px',
          padding: '14px 20px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        },
      }}
    />
  </StrictMode>
)

