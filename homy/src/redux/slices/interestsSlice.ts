// fe/src/redux/slices/interestsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store';
import { Property } from './propertySlice';
import { Profile } from './profileSlice';

const API_URL = 'http://localhost:3000/api';

// --- Interfaces ---
export interface Interest {
    _id: string;
    propertyId: Property;
    listerId: Profile; // Populated
    renterId: Profile; // Populated
    message: string;
    moveInDate: string;
    status: 'pending' | 'approved' | 'declined' | 'withdrawn';
    streamChannelId?: string;
    createdAt: string;
}

interface InterestsState {
    sentInterests: Interest[];
    receivedInterests: Interest[];
    isLoading: boolean;
    error: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// --- Initial State ---
const initialState: InterestsState = {
    sentInterests: [],
    receivedInterests: [],
    isLoading: false,
    error: null,
    status: 'idle',
};

// --- Async Thunks ---

export const fetchSentInterests = createAsyncThunk(
    'interests/fetchSent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/interests/sent`);
            return response.data as Interest[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch sent requests');
        }
    }
);

export const fetchReceivedInterests = createAsyncThunk(
    'interests/fetchReceived',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/interests/received`);
            return response.data as Interest[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch received requests');
        }
    }
);

export const withdrawInterest = createAsyncThunk(
    'interests/withdraw',
    async (interestId: string, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_URL}/interests/${interestId}`);
            return response.data.interest as Interest;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to withdraw request');
        }
    }
);

export const approveInterest = createAsyncThunk(
    'interests/approve',
    async (interestId: string, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/interests/${interestId}/approve`);
            return response.data.interest as Interest;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve request');
        }
    }
);

export const declineInterest = createAsyncThunk(
    'interests/decline',
    async (interestId: string, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/interests/${interestId}/decline`);
            return response.data.interest as Interest;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to decline request');
        }
    }
);

// --- Slice Definition ---
const interestsSlice = createSlice({
    name: 'interests',
    initialState,
    reducers: {
        clearInterestsState: (state) => {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state: InterestsState) => {
            state.isLoading = true;
            state.status = 'loading';
            state.error = null;
        };
        const handleRejected = (state: InterestsState, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.status = 'failed';
            state.error = action.payload;
        };

        // Fetch Sent
        builder.addCase(fetchSentInterests.pending, handlePending);
        builder.addCase(fetchSentInterests.fulfilled, (state, action) => {
            state.isLoading = false;
            state.status = 'succeeded';
            state.sentInterests = action.payload;
        });
        builder.addCase(fetchSentInterests.rejected, handleRejected);

        // Fetch Received
        builder.addCase(fetchReceivedInterests.pending, handlePending);
        builder.addCase(fetchReceivedInterests.fulfilled, (state, action) => {
            state.isLoading = false;
            state.status = 'succeeded';
            state.receivedInterests = action.payload;
        });
        builder.addCase(fetchReceivedInterests.rejected, handleRejected);

        // Withdraw (updates a sent interest)
        builder.addCase(withdrawInterest.pending, handlePending);
        builder.addCase(withdrawInterest.fulfilled, (state, action) => {
            state.isLoading = false;
            state.status = 'succeeded';
            const index = state.sentInterests.findIndex(i => i._id === action.payload._id);
            if (index !== -1) {
                state.sentInterests[index] = action.payload;
            }
        });
        builder.addCase(withdrawInterest.rejected, handleRejected);

        // Approve (updates a received interest)
        builder.addCase(approveInterest.pending, handlePending);
        builder.addCase(approveInterest.fulfilled, (state, action) => {
            state.isLoading = false;
            state.status = 'succeeded';
            const index = state.receivedInterests.findIndex(i => i._id === action.payload._id);
            if (index !== -1) {
                state.receivedInterests[index] = action.payload;
            }
        });
        builder.addCase(approveInterest.rejected, handleRejected);

        // Decline (updates a received interest)
        builder.addCase(declineInterest.pending, handlePending);
        builder.addCase(declineInterest.fulfilled, (state, action) => {
            state.isLoading = false;
            state.status = 'succeeded';
            const index = state.receivedInterests.findIndex(i => i._id === action.payload._id);
            if (index !== -1) {
                state.receivedInterests[index] = action.payload;
            }
        });
        builder.addCase(declineInterest.rejected, handleRejected);
    },
});

export const { clearInterestsState } = interestsSlice.actions;

// --- Selectors ---
export const selectSentInterests = (state: RootState) => state.interests.sentInterests;
export const selectReceivedInterests = (state: RootState) => state.interests.receivedInterests;
export const selectInterestsLoading = (state: RootState) => state.interests.isLoading;
export const selectInterestsError = (state: RootState) => state.interests.error;

export default interestsSlice.reducer;