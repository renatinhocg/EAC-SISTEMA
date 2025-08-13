import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config/api';

// Configurar axios base URL
axios.defaults.baseURL = API_BASE_URL;


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/admin">
      <App />
    </BrowserRouter>
  </StrictMode>
)
