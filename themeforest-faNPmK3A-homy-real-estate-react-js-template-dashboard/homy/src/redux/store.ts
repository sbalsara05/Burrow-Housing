import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import propertyReducer from './slices/propertySlice';
import filterReducer from './slices/filterSlice';

// --- Redux Persist Configuration ---
const persistConfig = {
    key: 'root', // Key for the persisted state in storage
    storage,      // Storage engine (localStorage by default)
    // Whitelist: Specify which slices to persist.
    // Only persist 'filters'. Auth token is already handled via localStorage in authSlice.
    // Profile/Property data is usually fetched on load, no need to persist large lists.
    whitelist: ['filters']
    // Blacklist: Alternatively, specify slices *not* to persist
    // blacklist: ['auth', 'profile', 'properties']
};

// Combine all reducers before wrapping with persistReducer
const rootReducer = combineReducers({
    auth: authReducer,
    profile: profileReducer,
    properties: propertyReducer,
    filters: filterReducer,
});

// Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- Configure Store with Persisted Reducer ---
export const store = configureStore({
    reducer: persistedReducer, // Use the persisted reducer
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            // Ignore specific actions from redux-persist
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
                'profile/updateProfile/pending', 'profile/updateProfile/fulfilled', 'profile/updateProfile/rejected', // Keep yours if needed
                'properties/addNewProperty/pending', 'properties/addNewProperty/fulfilled', 'properties/addNewProperty/rejected'],
            // Ignore specific paths if absolutely necessary (try to avoid)
            // ignoredPaths: ['filters.someNonSerializableField']
        }
    }),
});

// --- Create Persistor ---
export const persistor = persistStore(store); // Export persistor for PersistGate

// --- Types ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Default export remains the store
export default store;