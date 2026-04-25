import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store.ts';

const API_URL = '/api';

// Shape mirrors FormDataShape in AddPropertyBody but all optional
export interface PropertyDraft {
    _id: string;
    userId: string;
    propertyType?: string;
    overview?: {
        title?: string;
        category?: string;
        roomType?: string;
        neighborhood?: string;
        rent?: number | '';
    };
    listingDetails?: {
        size?: number | '';
        bedrooms?: number;
        bathrooms?: number;
        floorNo?: number;
    };
    amenities?: string[];
    addressAndLocation?: {
        address?: string;
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        zip?: string;
        location?: { lat: number; lng: number };
    };
    buildingName?: string;
    leaseLength?: string;
    description?: string;
    images?: string[];
    reminderSent?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DraftState {
    drafts: PropertyDraft[];
    isLoading: boolean;
    isSaving: boolean;
    lastSavedAt: string | null;
    error: string | null;
}

const initialState: DraftState = {
    drafts: [],
    isLoading: false,
    isSaving: false,
    lastSavedAt: null,
    error: null,
};

// Fetch all drafts for the logged-in user
export const fetchMyDrafts = createAsyncThunk(
    'drafts/fetchMyDrafts',
    async (_, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated.');
        try {
            const res = await axios.get(`${API_URL}/drafts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.drafts as PropertyDraft[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch drafts.');
        }
    }
);

interface SaveDraftPayload {
    draftId?: string;
    formData: Record<string, any>;
    location: { lat: number; lng: number };
}

// Create or update a draft
export const saveDraft = createAsyncThunk(
    'drafts/saveDraft',
    async ({ draftId, formData, location }: SaveDraftPayload, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated.');
        try {
            const body = {
                draftId,
                ...formData,
                addressAndLocation: {
                    ...formData.addressAndLocation,
                    location,
                },
            };
            const res = await axios.post(`${API_URL}/drafts`, body, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.draft as PropertyDraft;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to save draft.');
        }
    }
);

// Delete a draft (called on successful publish or manual discard)
export const deleteDraft = createAsyncThunk(
    'drafts/deleteDraft',
    async (draftId: string, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated.');
        try {
            await axios.delete(`${API_URL}/drafts/${draftId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return draftId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete draft.');
        }
    }
);

const draftSlice = createSlice({
    name: 'drafts',
    initialState,
    reducers: {
        clearDraftError: (state) => {
            state.error = null;
        },
        clearDrafts: (state) => {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchMyDrafts
            .addCase(fetchMyDrafts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyDrafts.fulfilled, (state, action: PayloadAction<PropertyDraft[]>) => {
                state.isLoading = false;
                state.drafts = action.payload;
            })
            .addCase(fetchMyDrafts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // saveDraft
            .addCase(saveDraft.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })
            .addCase(saveDraft.fulfilled, (state, action: PayloadAction<PropertyDraft>) => {
                state.isSaving = false;
                state.lastSavedAt = new Date().toISOString();
                const idx = state.drafts.findIndex(d => d._id === action.payload._id);
                if (idx !== -1) {
                    state.drafts[idx] = action.payload;
                } else {
                    state.drafts.unshift(action.payload);
                }
            })
            .addCase(saveDraft.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload as string;
            })

            // deleteDraft
            .addCase(deleteDraft.fulfilled, (state, action: PayloadAction<string>) => {
                state.drafts = state.drafts.filter(d => d._id !== action.payload);
                state.lastSavedAt = null;
            });
    },
});

export const { clearDraftError, clearDrafts } = draftSlice.actions;

export const selectDrafts = (state: RootState) => state.drafts.drafts;
export const selectDraftsLoading = (state: RootState) => state.drafts.isLoading;
export const selectDraftSaving = (state: RootState) => state.drafts.isSaving;
export const selectDraftLastSaved = (state: RootState) => state.drafts.lastSavedAt;
export const selectDraftError = (state: RootState) => state.drafts.error;

export default draftSlice.reducer;
