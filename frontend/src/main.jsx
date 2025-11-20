import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NetworkProvider } from './context/NetworkContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <NetworkProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </NetworkProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
