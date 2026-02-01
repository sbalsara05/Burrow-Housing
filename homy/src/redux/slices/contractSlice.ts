import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store.ts';

// --- Configuration ---
const API_URL = '/api';

// --- Interfaces ---
export interface Contract {
    _id: string;
    property: {
        _id: string;
        overview: { title: string };
        addressAndLocation: { address: string };
        images: string[];
    };
    lister: {
        _id: string;
        name: string;
        email: string;
    };
    tenant: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'DRAFT' | 'PENDING_TENANT_SIGNATURE' | 'PENDING_LISTER_SIGNATURE' | 'COMPLETED' | 'CANCELLED';
    templateHtml: string;
    variables: Record<string, string>;
    tenantSignature?: {
        url: string;
        signedAt: string;
    };
    listerSignature?: {
        url: string;
        signedAt: string;
    };
    finalPdfUrl?: string;
    createdAt: string;
    updatedAt: string;
    paymentStatus?: string;
    stripePaymentStatus?: string;
    listerPaymentStatus?: string;
    listerStripePaymentStatus?: string;
    paymentSnapshot?: {
        rentCents: number;
        tenantFeeCents: number;
        amountToChargeCents: number;
        amountToPayoutCents: number;
        paymentMethod?: string;
    };
    paymentExpiresAt?: string;
}

interface ContractState {
    contracts: Contract[];
    currentContract: Contract | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: ContractState = {
    contracts: [],
    currentContract: null,
    isLoading: false,
    error: null,
    successMessage: null,
};

// --- Async Thunks ---

// Initiate Draft
export const createDraft = createAsyncThunk(
    'contract/createDraft',
    async (payload: { propertyId: string; tenantId: string }, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            const response = await axios.post(
                `${API_URL}/contracts/initiate`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data as Contract;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create draft');
        }
    }
);

// Fetch User's Agreements
export const fetchMyAgreements = createAsyncThunk(
    'contract/fetchMyAgreements',
    async (_, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            const response = await axios.get(
                `${API_URL}/contracts/my-agreements`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data as Contract[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch agreements');
        }
    }
);

// Fetch Single Contract
export const fetchContractById = createAsyncThunk(
    'contract/fetchContractById',
    async (id: string, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            const response = await axios.get(
                `${API_URL}/contracts/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data as Contract;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch contract details');
        }
    }
);

// Update Draft
export const updateDraft = createAsyncThunk(
    'contract/updateDraft',
    async ({ id, data }: { id: string; data: { templateHtml: string; variables: any } }, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            const response = await axios.put(
                `${API_URL}/contracts/${id}/update-draft`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data as Contract;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update draft');
        }
    }
);

// Recall Contract (revert PENDING_TENANT_SIGNATURE to DRAFT for editing)
export const recallContract = createAsyncThunk(
    'contract/recallContract',
    async (id: string, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            const response = await axios.post(
                `${API_URL}/contracts/${id}/recall`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data as Contract;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to recall contract');
        }
    }
);

// Lock Contract
export const lockContract = createAsyncThunk(
    'contract/lockContract',
    async (id: string, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            const response = await axios.post(
                `${API_URL}/contracts/${id}/lock`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data as Contract;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to lock contract');
        }
    }
);

// Sign Contract (Tenant or Lister)
export const signContract = createAsyncThunk(
    'contract/signContract',
    async ({ id, signatureData }: { id: string; signatureData: string }, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            // We send the Base64 signature string to the backend
            // The backend will upload it to S3 and update the contract status
            const response = await axios.post(
                `${API_URL}/contracts/${id}/sign`,
                { signatureData },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data as Contract;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to sign contract');
        }
    }
);

// Delete Contract
export const deleteContract = createAsyncThunk(
    'contract/deleteContract',
    async (id: string, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            await axios.delete(
                `${API_URL}/contracts/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete contract');
        }
    }
);

export interface CreatePaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    amountCents: number;
    paymentStatus?: string;
    paymentSnapshot?: { amountToChargeCents: number; rentCents: number; tenantFeeCents: number };
}

// Create Stripe PaymentIntent (sublessee only, for COMPLETED contracts)
export const createPaymentIntent = createAsyncThunk(
    'contract/createPaymentIntent',
    async (
        payload: { contractId: string; paymentMethod?: 'card' | 'ach' },
        { getState, rejectWithValue }
    ) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');

        try {
            const response = await axios.post<CreatePaymentIntentResponse>(
                `${API_URL}/stripe/create-payment-intent`,
                { contractId: payload.contractId, paymentMethod: payload.paymentMethod || 'card' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create payment'
            );
        }
    }
);

// --- Slice Definition ---
const contractSlice = createSlice({
    name: 'contract',
    initialState,
    reducers: {
        clearContractErrors: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        resetCurrentContract: (state) => {
            state.currentContract = null;
        }
    },
    extraReducers: (builder) => {
        // Create Draft
        builder.addCase(createDraft.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createDraft.fulfilled, (state, action: PayloadAction<Contract>) => {
            state.isLoading = false;
            state.currentContract = action.payload;
            state.successMessage = "Draft initialized successfully";
        });
        builder.addCase(createDraft.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch My Agreements
        builder.addCase(fetchMyAgreements.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMyAgreements.fulfilled, (state, action: PayloadAction<Contract[]>) => {
            state.isLoading = false;
            state.contracts = action.payload;
        });
        builder.addCase(fetchMyAgreements.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Single Contract
        builder.addCase(fetchContractById.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchContractById.fulfilled, (state, action: PayloadAction<Contract>) => {
            state.isLoading = false;
            state.currentContract = action.payload;
        });
        builder.addCase(fetchContractById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Update Draft
        builder.addCase(updateDraft.fulfilled, (state, action: PayloadAction<Contract>) => {
            state.currentContract = action.payload;
            state.successMessage = "Draft saved";
        });

        // Recall Contract
        builder.addCase(recallContract.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(recallContract.fulfilled, (state, action: PayloadAction<Contract>) => {
            state.isLoading = false;
            state.currentContract = action.payload;
            state.successMessage = "Contract recalled. You can now edit.";
        });
        builder.addCase(recallContract.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Lock Contract
        builder.addCase(lockContract.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(lockContract.fulfilled, (state, action: PayloadAction<Contract>) => {
            state.isLoading = false;
            state.currentContract = action.payload;
            state.successMessage = "Contract sent to tenant successfully!";
        });
        builder.addCase(lockContract.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Sign Contract
        builder.addCase(signContract.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(signContract.fulfilled, (state, action: PayloadAction<Contract>) => {
            state.isLoading = false;
            state.currentContract = action.payload;
            state.successMessage = "Contract signed successfully!";
        });
        builder.addCase(signContract.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Delete Contract
        builder.addCase(deleteContract.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(deleteContract.fulfilled, (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.contracts = state.contracts.filter(c => c._id !== action.payload);
            state.successMessage = "Contract deleted successfully";
        });
        builder.addCase(deleteContract.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    }
});

export const { clearContractErrors, resetCurrentContract } = contractSlice.actions;
export default contractSlice.reducer;