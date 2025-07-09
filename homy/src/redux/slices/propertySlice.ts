import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store.ts';
import { updateUserRole } from './authSlice'; // ADDED FOR AUTOMATIC ROLE SYSTEM
// import {clearProfile} from './profileSlice';

// --- Configuration ---
const API_URL = 'http://localhost:3000/api';

// --- Interfaces ---
export interface Property {
    _id: string; // MongoDB ID
    userId: string; // Reference to User ObjectId as string
    overview: {
        title?: string;
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
        location: {
            lat: number;
            lng: number;
        }
    };
    buildingName?: string; // Optional
    leaseLength: string;
    description: string;
    images: string[]; // Array of image URLs
    status?: "Active" | "Pending" | "Inactive"; // Optional status field
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
        title?: string; // "Title" of the listing
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
        lat: number; // Add if needed (update: it was needed lol)
        lng: number;
    };
    buildingName?: string;
    leaseLength: string;
    description: string;
    imageUrls: string[];
    // Add other fields if needed by controller/model
}

interface AddPropertyPayload {
    propertyData: Omit<NewPropertyData, 'imageUrls'>; // All data except the final URLs
    files: File[]; // The actual file objects to be uploaded
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
    userPropertiesSort: string; // Holds the sort order for user properties (e.g., "Newest", "Oldest", etc.)
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
    userPropertiesSort: 'newest',
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

// NEW: Thunk to Fetch Full Properties for the Logged-in User
export const fetchUserProperties = createAsyncThunk(
    'properties/fetchUserProperties',
    async (_, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) {
            return rejectWithValue('User is not authenticated.');
        }
        console.log("Dispatching fetchUserProperties");
        try {
            // This endpoint now returns full property objects
            const response = await axios.get(`${API_URL}/properties`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("fetchUserProperties Fulfilled:", response.data);
            return response.data.properties as Property[]; // The payload is the array of properties
        } catch (error: any) {
            console.error("fetchUserProperties Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your properties.');
        }
    }
);

// Thunk to Fetch Property IDs for the Logged-in User (Retained for potential other uses)
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
            console.log("fetchUserPropertyIds Fulfilled (returning IDs only):", response.data);
            // This is now an example. The backend returns full objects, so we'd map to IDs if needed.
            const propertyIds = response.data.properties.map((p: Property) => p._id);
            return propertyIds;
        } catch (error: any) {
            console.error("fetchUserPropertyIds Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user property IDs.');
        }
    }
);

// Thunk to Add New Property
export const addNewProperty = createAsyncThunk(
    'properties/addNewProperty',
    async ({ propertyData, files }: AddPropertyPayload, { getState, dispatch, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) {
            return rejectWithValue('Not authenticated. Please log in.');
        }

        try {
            // Get Presigned URLs from our backend ---
            console.log("Phase 1: Requesting presigned URLs...");
            const fileInfo = files.map(file => ({ filename: file.name, contentType: file.type }));
            const presignedUrlResponse = await axios.post(
                `${API_URL}/properties/generate-upload-urls`,
                { files: fileInfo },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const uploadTargets: { signedUrl: string, publicUrl: string }[] = presignedUrlResponse.data;
            console.log("Phase 1: Received upload targets.", uploadTargets);

            // Upload files directly to DigitalOcean Spaces ---
            console.log("Phase 2: Uploading files directly to cloud...");
            await Promise.all(
                uploadTargets.map(async (target: { signedUrl: string }, index: number) => {
                    const file = files[index];
                    try {
                        const response = await fetch(target.signedUrl, {
                            method: 'PUT',
                            body: file,
                            headers: {
                                'Content-Type': file.type,
                                'x-amz-acl': 'public-read', // As required by DigitalOcean
                            },
                        });

                        if (!response.ok) {
                            // Throw an error to be caught by the outer catch block
                            throw new Error(`File upload failed for ${file.name} with status ${response.status}`);
                        }
                        console.log(`Successfully uploaded ${file.name}`);
                    } catch (uploadError) {
                        console.error(`Error uploading ${file.name}:`, uploadError);
                        // Re-throw the error to make the Promise.all fail
                        throw uploadError;
                    }
                })
            );
            console.log("Phase 2: All files uploaded successfully.");

            // Save final property data (with public URLs) to our backend ---
            console.log("Phase 3: Saving property to database...");
            const finalPropertyData = {
                ...propertyData,
                imageUrls: uploadTargets.map(target => target.publicUrl),
            };

            const createPropertyResponse = await axios.post(
                `${API_URL}/properties/add`,
                finalPropertyData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Phase 3: Property saved successfully.");

            // ADDED FOR AUTOMATIC ROLE SYSTEM:
            // Step 4: Update user role to lister since they now have properties
            console.log("Property created successfully, updating user role to lister");
            
            const state = getState() as any;
            const currentUser = state.auth.user;
            const currentPropertyCount = state.properties.userProperties?.length || 0;
            
            // Update user role to lister since they now have properties
            dispatch(updateUserRole({
                hasListings: true,
                isLister: true,
                listingCount: currentPropertyCount + 1
            }));

            // Refetch user's property list to include the new one
            dispatch(fetchUserProperties()); // MODIFIED: Refetch full properties, not just IDs

            return createPropertyResponse.data.property as Property;

        } catch (error: any) {
            console.error("addNewProperty thunk error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to add property. Please check all fields and try again.');
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
        },
        setUserPropertiesSort: (state, action: PayloadAction<string>) => {
            state.userPropertiesSort = action.payload;
        },
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
            .addCase(fetchAllPublicProperties.fulfilled, (state, action: PayloadAction<{
                properties: Property[],
                pagination: PaginationInfo
            }>) => {
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

            // --- Fetch Full User Properties ---
            .addCase(fetchUserProperties.pending, (state) => {
                console.log("Reducer: fetchUserProperties.pending");
                state.isUserPropertiesLoading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProperties.fulfilled, (state, action: PayloadAction<Property[]>) => {
                console.log("Reducer: fetchUserProperties.fulfilled");
                state.isUserPropertiesLoading = false;
                state.isLoading = false;
                state.userProperties = action.payload;
                // ADDED FOR AUTOMATIC ROLE SYSTEM: Update userPropertyIds too
                state.userPropertyIds = action.payload.map(property => property._id);
                state.status = 'succeeded';
            })
            .addCase(fetchUserProperties.rejected, (state, action) => {
                console.log("Reducer: fetchUserProperties.rejected", action.payload);
                state.isUserPropertiesLoading = false;
                state.isLoading = false;
                state.error = action.payload as string;
                state.status = 'failed';
                state.userProperties = [];
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
                state.status = 'succeeded';
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
                // Add the new property to the beginning of the userProperties array
                state.userProperties.unshift(action.payload);
                // ADDED FOR AUTOMATIC ROLE SYSTEM: Update userPropertyIds too
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
                state.isLoading = true;
                state.status = 'loading';
                state.error = null;
                state.currentProperty = null;
            })
            .addCase(fetchPropertyById.fulfilled, (state, action: PayloadAction<Property>) => {
                console.log("Reducer: fetchPropertyById.fulfilled");
                state.isLoading = false;
                state.currentProperty = action.payload;
                state.status = 'succeeded';
            })
            .addCase(fetchPropertyById.rejected, (state, action) => {
                console.log("Reducer: fetchPropertyById.rejected", action.payload);
                state.isLoading = false;
                state.error = action.payload as string;
                state.status = 'failed';
                state.currentProperty = null;
            });
    },
});

// --- Export Actions and Reducer ---
export const {
    clearPropertyError,
    setCurrentProperty,
    clearAllPropertyData,
    clearCurrentProperty,
    selectPropertyFromList,
    setUserPropertiesSort
} = propertySlice.actions;

// --- Selectors ---
export const selectPropertyState = (state: RootState) => state.properties;
export const selectAllPublicProperties = (state: RootState) => state.properties.allProperties;
export const selectUserProperties = (state: RootState) => state.properties.userProperties;
export const selectUserPropertyIds = (state: RootState) => state.properties.userPropertyIds; // ADDED FOR AUTOMATIC ROLE SYSTEM
export const selectUserPropertiesSort = (state: RootState) => state.properties.userPropertiesSort;
export const selectCurrentProperty = (state: RootState) => state.properties.currentProperty;
export const selectPublicPagination = (state: RootState) => state.properties.publicPagination;
export const selectPropertyLoading = (state: RootState) => state.properties.isLoading;
export const selectUserPropertiesLoading = (state: RootState) => state.properties.isUserPropertiesLoading;
export const selectIsAddingProperty = (state: RootState) => state.properties.isAddingProperty;
export const selectPropertyError = (state: RootState) => state.properties.error;
export const selectPropertyStatus = (state: RootState) => state.properties.status;

export default propertySlice.reducer;