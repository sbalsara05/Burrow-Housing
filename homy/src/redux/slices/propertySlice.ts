import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store.ts';
// import {clearProfile} from './profileSlice';

// --- Configuration ---
const API_URL = 'http://burrowhousing.com/api';

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
    userPublicProperties: Property[]; // Holds public properties added by the logged-in user
    userPropertyIds: string[]; // Holds only the IDs fetched from /api/properties initially
    currentProperty: Property | null; // Holds details for a single property view
    publicPagination: PaginationInfo | null; // Holds pagination data for public listings
    isLoading: boolean; // General loading state for property operations
    isUserPropertiesLoading: boolean; // Specific loading for user properties
    isPublicPropertiesLoading: boolean; // Specific loading for public properties
    isUserPublicPropertiesLoading: boolean; // Specific loading for user public properties
    isAddingProperty: boolean; // Specific loading for adding property
    error: string | null; // Stores error messages
    userPublicPropertiesError: string | null; // Error for user public properties
    status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Overall status
}

// Interface for the update payload
interface UpdatePropertyPayload {
    propertyId: string;
    propertyData: any; // Use 'any' for flexibility, as it will be FormData
}

// --- Initial State ---
const initialState: PropertyState = {
    allProperties: [],
    userProperties: [],
    userPropertiesSort: 'newest',
    userPublicProperties: [],
    userPropertyIds: [], // Initialize IDs array
    currentProperty: null,
    publicPagination: null,
    isLoading: false, // Combined loading state
    isUserPropertiesLoading: false,
    isPublicPropertiesLoading: false,
    isUserPublicPropertiesLoading: false,
    isAddingProperty: false,
    error: null,
    userPublicPropertiesError: null,
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

// Interface for the new thunk's payload
interface PresignedUrlPayload {
    files: { filename: string; contentType: string; }[];
}

//Thunk to Fetch Public Properties for a specific User ID
export const fetchPropertiesByUserId = createAsyncThunk(
    'properties/fetchByUserId',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/properties/user/${userId}`);
            return response.data as Property[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user listings.');
        }
    }
);

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

// Thunk to Delete a User Property
export const deleteUserProperty = createAsyncThunk(
  'properties/deleteUserProperty',
  async (propertyId: string, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) {
      return rejectWithValue('Not authenticated.');
    }
    console.log(`Dispatching deleteUserProperty for ID: ${propertyId}`);
    try {
      // Remove unused variable warning
      await axios.delete(`${API_URL}/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return propertyId;
    } catch (error: any) {
      console.error("deleteUserProperty Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property.');
    }
  }
);


// Thunk to Update a User Property
export const updateUserProperty = createAsyncThunk(
    'properties/updateUserProperty',
    async ({ propertyId, propertyData }: UpdatePropertyPayload, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) {
            return rejectWithValue('Not authenticated.');
        }
        console.log(`Dispatching updateUserProperty for ID: ${propertyId}`);
        try {
            const response = await axios.put(`${API_URL}/properties/${propertyId}`, propertyData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // When sending FormData, axios sets the Content-Type automatically.
                    // Do not set it manually here.
                }
            });
            return response.data.property as Property;
        } catch (error: any) {
            console.error("updateUserProperty Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to update property.');
        }
    }
);

// Dedicated Thunk for getting presigned URLs
export const getPresignedUrlsForUpload = createAsyncThunk(
    'properties/getPresignedUrlsForUpload',
    async (payload: PresignedUrlPayload, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) {
            return rejectWithValue('Not authenticated.');
        }
        try {
            const response = await axios.post(
                `${API_URL}/properties/generate-upload-urls`,
                { files: payload.files },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // This thunk's purpose is to return data directly, so we return it here.
            return response.data as { signedUrl: string, publicUrl: string }[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Could not get upload links.');
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

            // --- Fetch Properties by User ID (for Public Profile) ---
            .addCase(fetchPropertiesByUserId.pending, (state) => {
                state.isUserPublicPropertiesLoading = true;
                state.userPublicPropertiesError = null;
            })
            .addCase(fetchPropertiesByUserId.fulfilled, (state, action: PayloadAction<Property[]>) => {
                state.isUserPublicPropertiesLoading = false;
                state.userPublicProperties = action.payload;
            })
            .addCase(fetchPropertiesByUserId.rejected, (state, action) => {
                state.isUserPublicPropertiesLoading = false;
                state.userPublicPropertiesError = action.payload as string;
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
        })

        // --- Delete User Property ---
        .addCase(deleteUserProperty.pending, (state) => {
            console.log("Reducer: deleteUserProperty.pending");
            state.isLoading = true; // Use general loading state for this
            state.error = null;
        })
        .addCase(deleteUserProperty.fulfilled, (state, action: PayloadAction<string>) => {
            console.log("Reducer: deleteUserProperty.fulfilled");
            state.isLoading = false;
            // Filter out the deleted property from the userProperties array
            state.userProperties = state.userProperties.filter(
                (property) => property._id !== action.payload
            );
        })
        .addCase(deleteUserProperty.rejected, (state, action) => {
            console.log("Reducer: deleteUserProperty.rejected", action.payload);
            state.isLoading = false;
            state.error = action.payload as string;
        })

        // --- Update User Property ---
        .addCase(updateUserProperty.pending, (state) => {
            state.isLoading = true;
            state.isAddingProperty = true; // Reuse this state for the submit button
            state.error = null;
        })
        .addCase(updateUserProperty.fulfilled, (state, action: PayloadAction<Property>) => {
            state.isLoading = false;
            state.isAddingProperty = false;
            // Find the index of the property to update
            const index = state.userProperties.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                // Replace the old property with the updated one
                state.userProperties[index] = action.payload;
            }
            // Also update the currentProperty if it's the one being edited
            if (state.currentProperty?._id === action.payload._id) {
                state.currentProperty = action.payload;
            }
        })
        .addCase(updateUserProperty.rejected, (state, action) => {
            state.isLoading = false;
            state.isAddingProperty = false;
            state.error = action.payload as string;
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
export const selectAllPublicProperties = (state: RootState) =>
  state.properties?.allProperties || [];
export const selectUserProperties = (state: RootState) => state.properties.userProperties;
export const selectUserPropertiesSort = (state: RootState) => state.properties.userPropertiesSort;
export const selectCurrentProperty = (state: RootState) => state.properties.currentProperty;
export const selectPublicPagination = (state: RootState) => state.properties.publicPagination;
export const selectPropertyLoading = (state: RootState) => state.properties.isLoading;
export const selectUserPropertiesLoading = (state: RootState) => state.properties.isUserPropertiesLoading;
export const selectIsAddingProperty = (state: RootState) => state.properties.isAddingProperty;
export const selectPropertyError = (state: RootState) => state.properties.error;
export const selectPropertyStatus = (state: RootState) => state.properties.status;
export const selectUserPublicProperties = (state: RootState) => state.properties.userPublicProperties;
export const selectIsUserPublicPropertiesLoading = (state: RootState) => state.properties.isUserPublicPropertiesLoading;
export const selectUserPublicPropertiesError = (state: RootState) => state.properties.userPublicPropertiesError;

export default propertySlice.reducer;