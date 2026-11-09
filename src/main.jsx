import React from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from 'react-router-dom'
import TopProgressBar from './Components/TopProgressBar.jsx'

createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <BrowserRouter>
        <TopProgressBar/>
        <App />
      </BrowserRouter>,
    </GoogleOAuthProvider>
  </React.StrictMode>
)
