// frontend/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice'; // Import the new profile reducer

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer, // Add the profile reducer to the store
        // properties: propertyReducer, // Add later
        // filters: filterReducer,     // Add later
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            // Ignore actions/paths related to File objects if needed
            ignoredActions: ['profile/updateProfile/pending', 'profile/updateProfile/fulfilled', 'profile/updateProfile/rejected'],
            ignoredPaths: ['payload.image'], // Adjust if File object is in action payload directly
        }
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;