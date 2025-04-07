import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/index.scss'
import { Provider } from "react-redux";
import store from "./redux/store";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <GoogleOAuthProvider clientId="220393809553-40cjemj8m5tbeltqgrgtqoso7rfu1kil.apps.googleusercontent.com">
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </GoogleOAuthProvider>
    </Provider>,
)
