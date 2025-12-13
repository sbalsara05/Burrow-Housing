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
import AppErrorBoundary from './components/AppErrorBoundary';

// Set the base URL for all Axios requests from environment variables
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

const RootComponent = () => {
  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GoogleOAuthProvider clientId="220393809553-40cjemj8m5tbeltqgrgtqoso7rfu1kil.apps.googleusercontent.com">
            <React.StrictMode>
              <App />
            </React.StrictMode>
          </GoogleOAuthProvider>
        </PersistGate>
      </Provider>
    </AppErrorBoundary>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a <div id="root"></div> in your HTML.');
}

try {
  ReactDOM.createRoot(rootElement).render(<RootComponent />);
} catch (error) {
  console.error('Failed to render React app:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : String(error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: white; min-height: 100vh;">
      <h1 style="color: red; margin-bottom: 16px;">Failed to load application</h1>
      <p style="color: #333; margin-bottom: 8px;"><strong>Error:</strong> ${errorMessage}</p>
      <details style="margin-top: 16px;">
        <summary style="cursor: pointer; color: #666; margin-bottom: 8px;">Show Stack Trace</summary>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">${errorStack}</pre>
      </details>
      <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
    </div>
  `;
}
