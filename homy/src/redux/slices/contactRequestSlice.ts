import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Contact Request interface
interface ContactRequest {
    _id: string;
    seekerId: string; // User looking for housing
    listerId: string; // User who posted the property
    propertyId: string;
    propertyTitle: string;
    seekerName: string;
    seekerEmail: string;
    listerName?: string;
    listerEmail?: string;
    message: string;
    status: 'pending' | 'approved' | 'declined';
    createdAt: string;
    updatedAt?: string;
}

// State interface
interface ContactRequestState {
    requests: ContactRequest[];
    isLoading: boolean;
    error: string | null;
    // Statistics for dashboard
    pendingCount: number;
    approvedCount: number;
    declinedCount: number;
}

// Initial state
const initialState: ContactRequestState = {
    requests: [],
    isLoading: false,
    error: null,
    pendingCount: 0,
    approvedCount: 0,
    declinedCount: 0,
};

// Submit contact request (seeker contacts lister)
export const submitContactRequest = createAsyncThunk(
    'contactRequests/submit',
    async (requestData: {
        listerId: string;
        propertyId: string;
        propertyTitle: string;
        message: string;
    }, { getState, rejectWithValue }) => {
        try {
            const { user } = (getState() as any).auth;

            if (!user) {
                throw new Error('User must be logged in to submit contact requests');
            }

            if (user._id === requestData.listerId || user.id === requestData.listerId) {
                throw new Error('You cannot contact yourself about your own property');
            }

            const newRequest: ContactRequest = {
                _id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                seekerId: user._id || user.id,
                listerId: requestData.listerId,
                propertyId: requestData.propertyId,
                propertyTitle: requestData.propertyTitle,
                seekerName: user.name || user.username || 'Anonymous User',
                seekerEmail: user.email || 'no-email@example.com',
                message: requestData.message,
                status: 'pending',
                createdAt: new Date().toISOString(),
            };

            // Simulate API delay (replace with real API call in production)
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Contact request submitted to lister:', newRequest);
            return newRequest;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to submit contact request');
        }
    }
);

// Approve contact request (lister approves seeker)
export const approveContactRequest = createAsyncThunk(
    'contactRequests/approve',
    async (requestId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const request = state.contactRequests.requests.find((r: ContactRequest) => r._id === requestId);

            if (!request) {
                throw new Error('Contact request not found');
            }

            // Simulate creating chat channel (replace with real implementation later)
            console.log('Creating chat channel between seeker and lister:', {
                seekerId: request.seekerId,
                listerId: request.listerId,
                propertyId: request.propertyId,
                propertyTitle: request.propertyTitle
            });

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Contact request approved and chat channel created');
            return {
                requestId,
                updatedAt: new Date().toISOString(),
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to approve contact request');
        }
    }
);

// Decline contact request
export const declineContactRequest = createAsyncThunk(
    'contactRequests/decline',
    async (requestId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const request = state.contactRequests.requests.find((r: ContactRequest) => r._id === requestId);

            if (!request) {
                throw new Error('Contact request not found');
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('Contact request declined:', requestId);
            return {
                requestId,
                updatedAt: new Date().toISOString(),
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to decline contact request');
        }
    }
);

// Fetch contact requests for current user (as lister)
export const fetchContactRequests = createAsyncThunk(
    'contactRequests/fetchRequests',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { user } = (getState() as any).auth;

            if (!user) {
                throw new Error('User must be logged in to fetch contact requests');
            }

            // Simulate API call (replace with real API call in production)
            await new Promise(resolve => setTimeout(resolve, 500));

            // For demo purposes, return empty array
            // In production, this would fetch requests from your backend
            console.log('Fetching contact requests for user:', user._id || user.id);
            return [];
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch contact requests');
        }
    }
);

// Helper function to update statistics
const updateStatistics = (state: ContactRequestState) => {
    state.pendingCount = state.requests.filter(r => r.status === 'pending').length;
    state.approvedCount = state.requests.filter(r => r.status === 'approved').length;
    state.declinedCount = state.requests.filter(r => r.status === 'declined').length;
};

// Slice definition
const contactRequestSlice = createSlice({
    name: 'contactRequests',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        // For demo purposes - add mock requests
        addMockRequest: (state, action: PayloadAction<ContactRequest>) => {
            state.requests.push(action.payload);
            updateStatistics(state);
        },

        // Clear all requests (e.g., on logout)
        clearAllRequests: (state) => {
            state.requests = [];
            state.error = null;
            state.pendingCount = 0;
            state.approvedCount = 0;
            state.declinedCount = 0;
        },

        // Manually update request status (for demo purposes)
        updateRequestStatus: (state, action: PayloadAction<{
            requestId: string;
            status: 'pending' | 'approved' | 'declined';
        }>) => {
            const request = state.requests.find(r => r._id === action.payload.requestId);
            if (request) {
                request.status = action.payload.status;
                request.updatedAt = new Date().toISOString();
                updateStatistics(state);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Submit contact request
            .addCase(submitContactRequest.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(submitContactRequest.fulfilled, (state, action) => {
                state.isLoading = false;
                state.requests.push(action.payload);
                updateStatistics(state);
            })
            .addCase(submitContactRequest.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Approve contact request
            .addCase(approveContactRequest.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(approveContactRequest.fulfilled, (state, action) => {
                state.isLoading = false;
                const request = state.requests.find(r => r._id === action.payload.requestId);
                if (request) {
                    request.status = 'approved';
                    request.updatedAt = action.payload.updatedAt;
                }
                updateStatistics(state);
            })
            .addCase(approveContactRequest.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Decline contact request
            .addCase(declineContactRequest.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(declineContactRequest.fulfilled, (state, action) => {
                state.isLoading = false;
                const request = state.requests.find(r => r._id === action.payload.requestId);
                if (request) {
                    request.status = 'declined';
                    request.updatedAt = action.payload.updatedAt;
                }
                updateStatistics(state);
            })
            .addCase(declineContactRequest.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch contact requests
            .addCase(fetchContactRequests.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchContactRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.requests = action.payload;
                updateStatistics(state);
            })
            .addCase(fetchContactRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions and reducer
export const {
    clearError,
    addMockRequest,
    clearAllRequests,
    updateRequestStatus
} = contactRequestSlice.actions;

// Selectors
export const selectContactRequests = (state: any) => state.contactRequests.requests;
export const selectContactRequestsLoading = (state: any) => state.contactRequests.isLoading;
export const selectContactRequestsError = (state: any) => state.contactRequests.error;
export const selectPendingRequests = (state: any) =>
    state.contactRequests.requests.filter((r: ContactRequest) => r.status === 'pending');
export const selectApprovedRequests = (state: any) =>
    state.contactRequests.requests.filter((r: ContactRequest) => r.status === 'approved');
export const selectContactRequestStats = (state: any) => ({
    pending: state.contactRequests.pendingCount,
    approved: state.contactRequests.approvedCount,
    declined: state.contactRequests.declinedCount,
    total: state.contactRequests.requests.length,
});

export default contactRequestSlice.reducer;