import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// For environment variables in Vite, use import.meta.env instead of require('dotenv')
// Vite automatically loads variables from .env that start with VITE_

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
