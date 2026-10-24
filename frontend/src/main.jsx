import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PageSelector from './components/PageSelector.jsx'
import TelegramStudio from './components/TelegramStudio.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <PageSelector />
    <TelegramStudio />
  </React.StrictMode>,
)
