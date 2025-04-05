import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId="220393809553-40cjemj8m5tbeltqgrgtqoso7rfu1kil.apps.googleusercontent.com">
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </GoogleOAuthProvider>,
)
