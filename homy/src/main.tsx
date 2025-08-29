import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/index.scss'
import "./styles/bootstrap-bridge-tailwind.scss"
// import "./styles/tailwind.scss"
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate
import store, { persistor } from './redux/slices/store.ts'; // Import both store and persistor
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS
import axios from 'axios';

// Set the base URL for all Axios requests from environment variables
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <GoogleOAuthProvider clientId="220393809553-40cjemj8m5tbeltqgrgtqoso7rfu1kil.apps.googleusercontent.com">
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            </GoogleOAuthProvider>
        </PersistGate>
    </Provider>,
)
