import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './lab.css'
import './unit1.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)