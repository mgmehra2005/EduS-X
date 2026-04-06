import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { setAuthToken } from './utils/api'

// Load token from localStorage (if any) and set Authorization header
const token = localStorage.getItem('edusx_token')
if (token) setAuthToken(token)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
