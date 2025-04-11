import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
import { clearProfile } from './profileSlice';

// --- Configuration ---
const API_URL = 'http://localhost:3000/api';

// --- Interfaces ---
export interface Property {
    _id: string; // MongoDB ID
    userId: string; // Reference to User ObjectId as string
    overview: {
        category: "Single Room" | "Apartment";
        roomType: "Shared Room" | "Single Room";
        neighborhood: "Any" | "Allston" | "Back Bay" | "Beacon Hill" | "Brighton" | "Charlestown" | "Chinatown" | "Dorchester" | "Fenway" | "Hyde Park" | "Jamaica Plain" | "Mattapan" | "Mission Hill" | "North End" | "Roslindale" | "Roxbury" | "South Boston" | "South End" | "West End" | "West Roxbury" | "Wharf District";
        rent: number;
    };
    listingDetails: {
        size?: number; // Optional size
        bedrooms: 1 | 2 | 3 | 4 | 5;
        bathrooms: 1 | 2 | 3;
        floorNo: number;
    };
    amenities?: string[]; // Array of amenity strings
    addressAndLocation: {
        address: string;
    };
    buildingName?: string; // Optional
    leaseLength: string;
    description: string;
    createdAt: string; // Store as ISO string date from MongoDB
    updatedAt: string; // Store as ISO string date from MongoDB
}

// Interface defining the structure expected by the thunk/backend (excluding userId)
interface NewPropertyData {
    overview: {
        category: string;
        roomType: string;
        neighborhood: string;
        rent: number;
    };
    listingDetails: {
        size?: number;
        bedrooms: number;
        bathrooms: number;
        floorNo: number;
    };
    amenities?: string[];
    addressAndLocation: { // Match backend controller expectation
        address: string;
        // latitude?: number; // Add if needed
        // longitude?: number;
    };
    buildingName?: string;
    leaseLength: string;
    description: string;
    // Add other fields if needed by controller/model
}


// Pagination info structure matching the backend response
interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// Shape of the Property state in Redux
interface PropertyState {
    allProperties: Property[]; // Holds the properties for the *current* page of public listings
    userProperties: Property[]; // Holds full property objects added by the logged-in user
    userPropertyIds: string[]; // Holds only the IDs fetched from /api/properties initially
    currentProperty: Property | null; // Holds details for a single property view
    publicPagination: PaginationInfo | null; // Holds pagination data for public listings
    isLoading: boolean; // General loading state for property operations
    isUserPropertiesLoading: boolean; // Specific loading for user properties
    isPublicPropertiesLoading: boolean; // Specific loading for public properties
    isAddingProperty: boolean; // Specific loading for adding property
    error: string | null; // Stores error messages
    status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Overall status
}

// --- Initial State ---
const initialState: PropertyState = {
    allProperties: [],
    userProperties: [],
    userPropertyIds: [], // Initialize IDs array
    currentProperty: null,
    publicPagination: null,
    isLoading: false, // Combined loading state
    isUserPropertiesLoading: false,
    isPublicPropertiesLoading: false,
    isAddingProperty: false,
    error: null,
    status: 'idle',
};

// --- Async Thunks (API Interactions) ---

// Thunk to Fetch All Public Properties (Paginated and Filtered)
interface FetchPropertiesPayload {
    page?: number;
    limit?: number;
    category?: string;
    neighborhood?: string;
    rentRange?: string;
    // Add other potential backend filters here
}
export const fetchAllPublicProperties = createAsyncThunk(
    'properties/fetchAllPublicProperties',
    // *** Thunk now directly accepts the full payload including filters ***
    async (fetchArgs: FetchPropertiesPayload, { rejectWithValue }) => {
        // Set defaults if not provided in args
        const { page = 1, limit = 9, ...filters } = fetchArgs;

        // Construct params directly from fetchArgs (which now contains the filters)
        const params = { page, limit, ...filters };

        console.log(`Dispatching fetchAllPublicProperties with direct params:`, params);
        try {
            const response = await axios.get(`${API_URL}/properties/all`, { params }); // Use params directly
            console.log("fetchAllPublicProperties Fulfilled:", response.data);
            return response.data as { properties: Property[], pagination: PaginationInfo, message: string };
        } catch (error: any) {
            console.error("fetchAllPublicProperties Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch public properties.');
        }
    }
);

// Thunk to Fetch Property IDs for the Logged-in User
export const fetchUserPropertyIds = createAsyncThunk(
    'properties/fetchUserPropertyIds',
    async (_, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        console.log("Dispatching fetchUserPropertyIds");
        try {
            const response = await axios.get(`${API_URL}/properties`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Backend returns { message, properties: [IDs] }
            console.log("fetchUserPropertyIds Fulfilled:", response.data);
            return (response.data.properties || []) as string[]; // Return array of IDs
        } catch (error: any) {
            console.error("fetchUserPropertyIds Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user property IDs.');
        }
    }
);

// Thunk to Fetch Full Details for User Properties (using IDs) - Example Implementation
// You might call this after fetchUserPropertyIds succeeds
// export const fetchFullUserProperties = createAsyncThunk(
//     'properties/fetchFullUserProperties',
//     async (propertyIds: string[], { rejectWithValue }) => {
//         if (!propertyIds || propertyIds.length === 0) return []; // No IDs to fetch
//         console.log("Dispatching fetchFullUserProperties for IDs:", propertyIds);
//         try {
//             // This assumes you have a backend endpoint like GET /api/properties/batch?ids=id1,id2,id3
//             // Or you might need to make multiple requests to GET /api/properties/:id (less efficient)
//             // For now, let's simulate fetching from allProperties if they exist there (not ideal)
//             // const response = await axios.get(`${API_URL}/properties/batch`, { params: { ids: propertyIds.join(',') } });
//             // return response.data.properties as Property[];
//             console.warn("fetchFullUserProperties: Needs backend endpoint or alternative fetch strategy.");
//             return [] as Property[]; // Placeholder return
//         } catch (error: any) {
//             console.error("fetchFullUserProperties Error:", error.response?.data || error.message);
//             return rejectWithValue('Failed to fetch full user property details.');
//         }
//     }
// );

// Thunk to Add New Property
export const addNewProperty = createAsyncThunk(
    'properties/addNewProperty',
    // *** Thunk now expects a plain object, not FormData ***
    async (propertyData: NewPropertyData, { getState, dispatch, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        console.log("Dispatching addNewProperty with data:", propertyData);
        try {
            const response = await axios.post(
                `${API_URL}/properties/add`,
                propertyData, // Send the JS object directly
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json', // Explicitly set content type
                    }
                }
            );
            console.log("addNewProperty Fulfilled:", response.data);
            // Optionally refetch user properties or just add locally
            dispatch(fetchUserPropertyIds()); // Refetch IDs after adding is a good idea
            return response.data.property as Property;
        } catch (error: any) {
            console.error("addNewProperty Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to add property.');
        }
    }
);

// Thunk to Fetch Single Property Details (Needs backend endpoint GET /api/properties/:id)
export const fetchPropertyById = createAsyncThunk(
    'properties/fetchPropertyById',
    async (propertyId: string, { rejectWithValue }) => {
        console.log(`Dispatching fetchPropertyById API call for ID: ${propertyId}`);
        try {
            const response = await axios.get(`${API_URL}/properties/id/${propertyId}`); // Call the new backend endpoint
            if (!response.data) {
                throw new Error('Property not found from API');
            }
            console.log(`fetchPropertyById API Success for ID ${propertyId}`);
            return response.data as Property;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch property details.';
            console.error(`fetchPropertyById API Error for ID ${propertyId}:`, message);
            return rejectWithValue(message);
        }
    }
);



// --- Slice Definition ---
const propertySlice = createSlice({
    name: 'properties',
    initialState,
    reducers: {
        clearPropertyError: (state) => {
            state.error = null;
        },
        setCurrentProperty: (state, action: PayloadAction<Property | null>) => {
            state.currentProperty = action.payload;
        },
        // Action to clear all property data on logout
        clearAllPropertyData: (state) => {
            console.log("Reducer: clearAllPropertyData");
            // Reset to initial state values
            Object.assign(state, initialState);
        },
        selectPropertyFromList: (state, action: PayloadAction<Property | null>) => {
            console.log("Reducer: selectPropertyFromList with payload:", action.payload?._id);
            state.currentProperty = action.payload;
            state.isLoading = false; // Ensure loading is off
            state.status = action.payload ? 'succeeded' : 'idle'; // Set status
            state.error = null; // Clear any previous error
        },
        // Action to clear current property (used on unmount)
        clearCurrentProperty: (state) => {
            console.log("Reducer: clearCurrentProperty");
            state.currentProperty = null;
            state.status = 'idle'; // Reset status related to single fetch
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch All Public Properties ---
            .addCase(fetchAllPublicProperties.pending, (state) => {
                console.log("Reducer: fetchAllPublicProperties.pending");
                state.isPublicPropertiesLoading = true;
                state.isLoading = true; // Set general loading too
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllPublicProperties.fulfilled, (state, action: PayloadAction<{ properties: Property[], pagination: PaginationInfo }>) => {
                console.log("Reducer: fetchAllPublicProperties.fulfilled");
                state.isPublicPropertiesLoading = false;
                state.isLoading = false;
                state.allProperties = action.payload.properties;
                state.publicPagination = action.payload.pagination;
                state.status = 'succeeded';
            })
            .addCase(fetchAllPublicProperties.rejected, (state, action) => {
                console.log("Reducer: fetchAllPublicProperties.rejected", action.payload);
                state.isPublicPropertiesLoading = false;
                state.isLoading = false;
                state.error = action.payload as string;
                state.status = 'failed';
                state.allProperties = [];
                state.publicPagination = null;
            })

            // --- Fetch User Property IDs ---
            .addCase(fetchUserPropertyIds.pending, (state) => {
                console.log("Reducer: fetchUserPropertyIds.pending");
                state.isUserPropertiesLoading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserPropertyIds.fulfilled, (state, action: PayloadAction<string[]>) => {
                console.log("Reducer: fetchUserPropertyIds.fulfilled");
                state.isUserPropertiesLoading = false;
                state.isLoading = false;
                state.userPropertyIds = action.payload;
                // **Decision:** Do we fetch full details now? Or leave it to the component?
                // If fetching now: dispatch(fetchFullUserProperties(action.payload));
                // For simplicity now, we just store IDs. Component needs to handle fetching details.
                state.status = 'succeeded'; // Or keep loading if fetching details
            })
            .addCase(fetchUserPropertyIds.rejected, (state, action) => {
                console.log("Reducer: fetchUserPropertyIds.rejected", action.payload);
                state.isUserPropertiesLoading = false;
                state.isLoading = false;
                state.error = action.payload as string;
                state.status = 'failed';
                state.userPropertyIds = [];
            })

            // --- Add New Property ---
            .addCase(addNewProperty.pending, (state) => {
                console.log("Reducer: addNewProperty.pending");
                state.isAddingProperty = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addNewProperty.fulfilled, (state, action: PayloadAction<Property>) => {
                console.log("Reducer: addNewProperty.fulfilled");
                state.isAddingProperty = false;
                state.isLoading = false;
                // Add to userProperties list immediately
                // state.userProperties.unshift(action.payload); // Or refetch IDs/Details
                // Add the new ID to userPropertyIds
                state.userPropertyIds.unshift(action.payload._id);
                state.status = 'succeeded';
            })
            .addCase(addNewProperty.rejected, (state, action) => {
                console.log("Reducer: addNewProperty.rejected", action.payload);
                state.isAddingProperty = false;
                state.isLoading = false;
                state.error = action.payload as string;
                state.status = 'failed';
            })

            // --- Fetch Single Property By ID ---
            .addCase(fetchPropertyById.pending, (state) => {
                console.log("Reducer: fetchPropertyById.pending");
                state.isLoading = true; state.status = 'loading'; state.error = null; state.currentProperty = null;
            })
            .addCase(fetchPropertyById.fulfilled, (state, action: PayloadAction<Property>) => {
                console.log("Reducer: fetchPropertyById.fulfilled");
                state.isLoading = false; state.currentProperty = action.payload; state.status = 'succeeded';
            })
            .addCase(fetchPropertyById.rejected, (state, action) => {
                console.log("Reducer: fetchPropertyById.rejected", action.payload);
                state.isLoading = false; state.error = action.payload as string; state.status = 'failed'; state.currentProperty = null;
            });
    },
});

// --- Export Actions and Reducer ---
export const { clearPropertyError, setCurrentProperty, clearAllPropertyData, clearCurrentProperty, selectPropertyFromList } = propertySlice.actions;

// --- Selectors ---
export const selectPropertyState = (state: RootState) => state.properties;
export const selectAllPublicProperties = (state: RootState) => state.properties.allProperties;
export const selectUserPropertyIds = (state: RootState) => state.properties.userPropertyIds;
export const selectUserProperties = (state: RootState) => state.properties.userProperties; // If storing full objects
export const selectCurrentProperty = (state: RootState) => state.properties.currentProperty;
export const selectPublicPagination = (state: RootState) => state.properties.publicPagination;
export const selectPropertyLoading = (state: RootState) => state.properties.isLoading;
export const selectUserPropertiesLoading = (state: RootState) => state.properties.isUserPropertiesLoading;
export const selectPublicPropertiesLoading = (state: RootState) => state.properties.isPublicPropertiesLoading;
export const selectIsAddingProperty = (state: RootState) => state.properties.isAddingProperty;
export const selectPropertyError = (state: RootState) => state.properties.error;
export const selectPropertyStatus = (state: RootState) => state.properties.status;

export default propertySlice.reducer;