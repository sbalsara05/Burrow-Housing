import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/index.scss'
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate
import store, { persistor } from './redux/store.ts'; // Import both store and persistor

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
