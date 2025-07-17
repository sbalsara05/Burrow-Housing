
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store';
import { Property } from './propertySlice';

// --- Configuration ---
const API_URL = 'http://localhost:3000/api';

// --- Interfaces ---
interface FavoritesState {
    favorites: Property[];
    favoriteIds: string[]; // For quick lookup
    isLoading: boolean;
    error: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// --- Initial State ---
const initialState: FavoritesState = {
    favorites: [],
    favoriteIds: [],
    isLoading: false,
    error: null,
    status: 'idle',
};

// --- Async Thunks ---

// Fetch user's favorites
export const fetchFavorites = createAsyncThunk(
    'favorites/fetchFavorites',
    async (_, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        
        try {
            const response = await axios.get(`${API_URL}/favorites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.favorites as Property[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
        }
    }
);

// Add property to favorites
export const addToFavorites = createAsyncThunk(
    'favorites/addToFavorites',
    async (propertyId: string, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        
        try {
            const response = await axios.post(`${API_URL}/favorites`, 
                { propertyId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.property as Property;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add to favorites');
        }
    }
);

// Remove property from favorites
export const removeFromFavorites = createAsyncThunk(
    'favorites/removeFromFavorites',
    async (propertyId: string, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        
        try {
            await axios.delete(`${API_URL}/favorites/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return propertyId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove from favorites');
        }
    }
);

// --- Slice Definition ---
const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        clearFavorites: (state) => {
            state.favorites = [];
            state.favoriteIds = [];
            state.error = null;
            state.status = 'idle';
        },
        clearFavoritesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch favorites
            .addCase(fetchFavorites.pending, (state) => {
                state.isLoading = true;
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchFavorites.fulfilled, (state, action: PayloadAction<Property[]>) => {
                state.isLoading = false;
                state.status = 'succeeded';
                state.favorites = action.payload;
                state.favoriteIds = action.payload.map(prop => prop._id);
                state.error = null;
            })
            .addCase(fetchFavorites.rejected, (state, action) => {
                state.isLoading = false;
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Add to favorites
            .addCase(addToFavorites.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addToFavorites.fulfilled, (state, action: PayloadAction<Property>) => {
                state.isLoading = false;
                state.favorites.push(action.payload);
                state.favoriteIds.push(action.payload._id);
                state.error = null;
            })
            .addCase(addToFavorites.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Remove from favorites
            .addCase(removeFromFavorites.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(removeFromFavorites.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                const propertyId = action.payload;
                state.favorites = state.favorites.filter(prop => prop._id !== propertyId);
                state.favoriteIds = state.favoriteIds.filter(id => id !== propertyId);
                state.error = null;
            })
            .addCase(removeFromFavorites.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

// --- Export Actions and Reducer ---
export const { clearFavorites, clearFavoritesError } = favoritesSlice.actions;

// --- Selectors ---
export const selectFavorites = (state: RootState) => state.favorites.favorites;
export const selectFavoriteIds = (state: RootState) => state.favorites.favoriteIds;
export const selectFavoritesLoading = (state: RootState) => state.favorites.isLoading;
export const selectFavoritesError = (state: RootState) => state.favorites.error;
export const selectFavoritesStatus = (state: RootState) => state.favorites.status;

// Helper selector to check if a property is favorited
export const selectIsPropertyFavorited = (state: RootState, propertyId: string) => 
    state.favorites.favoriteIds.includes(propertyId);

export default favoritesSlice.reducer;
