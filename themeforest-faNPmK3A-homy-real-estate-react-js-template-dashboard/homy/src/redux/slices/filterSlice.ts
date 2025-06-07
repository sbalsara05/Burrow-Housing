// frontend/redux/slices/filterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store.ts';
// Import FetchPropertiesPayload if needed by selectApiFormattedFilters
import  FetchPropertiesPayload  from './propertySlice'; // Adjust path as necessary

// --- Interfaces ---
interface FilterState {
    searchTerm: string;
    // **** ADDED/UPDATED state fields ****
    category: string | null;       // e.g., "Single Room", "Apartment"
    roomType: string | null;       // e.g., "Shared Room", "Single Room"
    neighborhood: string | null;   // e.g., "Allston", "Any"
    rentRange: string | null;      // Stores the *string* value from dropdown (e.g., "$1000 - $1500")
    priceRangeValues: [number, number]; // Stores the numerical range [min, max]
    bedrooms: string;          // '0', '1', '2', etc. ('0' means "Any")
    bathrooms: string;         // '0', '1', '2', etc. ('0' means "Any")
    amenities: string[];
    sqftRange: [number | null, number | null]; // [min, max] SQFT values
    // **** END ADDED/UPDATED state fields ****

    sortBy: string;            // e.g., 'newest', 'price_low', 'price_high'
    maxPriceForSlider: number; // Max price for UI slider initialization
}

// --- Constants ---
const DEFAULT_MAX_PRICE = 5000; // Adjust as needed
const DEFAULT_SORT = 'newest';

// --- Initial State ---
const initialState: FilterState = {
    searchTerm: '',
    // **** ADDED/UPDATED initial values ****
    category: null,
    roomType: null,
    neighborhood: 'Any',
    rentRange: null,
    priceRangeValues: [0, DEFAULT_MAX_PRICE],
    bedrooms: '0',
    bathrooms: '0',
    amenities: [],
    sqftRange: [null, null],
    // **** END ADDED/UPDATED initial values ****

    sortBy: DEFAULT_SORT,
    maxPriceForSlider: DEFAULT_MAX_PRICE,
};

// --- Helper: Parse Rent Range String ---
const parseRentRange = (rentRangeString: string | null, maxPrice: number): [number, number] => {
    if (!rentRangeString || rentRangeString.toLowerCase() === 'any price') return [0, maxPrice];

    const cleanedRange = rentRangeString.replace(/[$,]/g, '');
    if (cleanedRange.includes('+')) {
        const minRent = parseInt(cleanedRange.replace('+', ''), 10);
        // Use MAX_SAFE_INTEGER to represent infinity for the API or filtering logic later
        return !isNaN(minRent) ? [minRent, Number.MAX_SAFE_INTEGER] : [0, maxPrice];
    } else if (cleanedRange.includes('-')) {
        const parts = cleanedRange.split('-').map(part => parseInt(part.trim(), 10));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return [parts[0], parts[1]];
        }
    }
    console.warn(`Could not parse rentRange string: ${rentRangeString}`);
    return [0, maxPrice]; // Fallback
}

// --- Slice Definition ---
const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        // **** ADDED/UPDATED reducers ****
        setCategory: (state, action: PayloadAction<string | null>) => {
            state.category = action.payload === 'all' || action.payload === 'Any Category' ? null : action.payload;
        },
        setRoomType: (state, action: PayloadAction<string | null>) => {
            state.roomType = action.payload === 'all' || action.payload === 'Any Type' ? null : action.payload;
        },
        setNeighborhood: (state, action: PayloadAction<string | null>) => {
            // Keep 'Any' as the string value, filtering logic handles it
            state.neighborhood = action.payload;
        },
        setRentRange: (state, action: PayloadAction<string | null>) => {
            state.rentRange = action.payload === 'any' || action.payload === 'Any Price' ? null : action.payload; // Store string, handle 'any'
            state.priceRangeValues = parseRentRange(state.rentRange, state.maxPriceForSlider); // Update numerical range
        },
        setPriceRangeValues: (state, action: PayloadAction<[number, number]>) => {
            state.priceRangeValues = action.payload;
            // Clear the dropdown string if slider is used, as they might diverge
            state.rentRange = null;
        },
        setBedrooms: (state, action: PayloadAction<string>) => {
            state.bedrooms = action.payload;
        },
        setBathrooms: (state, action: PayloadAction<string>) => {
            state.bathrooms = action.payload;
        },
        toggleAmenity: (state, action: PayloadAction<string>) => {
            const amenity = action.payload;
            const index = state.amenities.indexOf(amenity);
            if (index >= 0) { state.amenities.splice(index, 1); }
            else { state.amenities.push(amenity); }
        },
        setSqftMin: (state, action: PayloadAction<number | null>) => {
            state.sqftRange[0] = action.payload;
        },
        setSqftMax: (state, action: PayloadAction<number | null>) => {
            state.sqftRange[1] = action.payload;
        },
        setMaxPriceForSlider: (state, action: PayloadAction<number>) => {
            const newMax = action.payload > 0 ? action.payload : DEFAULT_MAX_PRICE;
            state.maxPriceForSlider = newMax;
            // Adjust numerical range if current max exceeds new max
            if (state.priceRangeValues[1] > newMax || state.priceRangeValues[1] === Number.MAX_SAFE_INTEGER) {
                state.priceRangeValues[1] = newMax;
            }
            // Adjust string range if needed
            const parsedCurrent = parseRentRange(state.rentRange, newMax);
            if (parsedCurrent[1] > newMax && parsedCurrent[1] !== Number.MAX_SAFE_INTEGER) {
                state.rentRange = null; // Clear incompatible dropdown selection
            }
        },
        // **** END ADDED/UPDATED reducers ****

        setSortBy: (state, action: PayloadAction<string>) => {
            state.sortBy = action.payload;
        },
        resetFilters: (state) => {
            const maxPrice = state.maxPriceForSlider; // Preserve max price
            Object.assign(state, initialState, {
                maxPriceForSlider: maxPrice,
                priceRangeValues: [0, maxPrice] // Reset numerical range to full extent
            });
            console.log("Reducer: resetFilters called.");
        },
    },
});

// --- Export Actions and Reducer ---
export const {
    setSearchTerm,
    setCategory,
    setRoomType,
    setNeighborhood,
    setRentRange,
    setPriceRangeValues,
    setBedrooms,
    setBathrooms,
    toggleAmenity,
    setSqftMin,
    setSqftMax,
    setMaxPriceForSlider,
    setSortBy,
    resetFilters,
} = filterSlice.actions;

// --- Selectors ---
export const selectFilters = (state: RootState) => state.filters;
export const selectSearchTerm = (state: RootState) => state.filters.searchTerm;
export const selectCategory = (state: RootState) => state.filters.category;
export const selectRoomType = (state: RootState) => state.filters.roomType;
export const selectNeighborhood = (state: RootState) => state.filters.neighborhood;
export const selectRentRange = (state: RootState) => state.filters.rentRange; // String value from dropdown
export const selectPriceRangeValues = (state: RootState) => state.filters.priceRangeValues; // Numerical [min, max]
export const selectBedrooms = (state: RootState) => state.filters.bedrooms;
export const selectBathrooms = (state: RootState) => state.filters.bathrooms;
export const selectAmenities = (state: RootState) => state.filters.amenities;
export const selectSqftRange = (state: RootState) => state.filters.sqftRange;
export const selectMaxPriceForSlider = (state: RootState) => state.filters.maxPriceForSlider;
export const selectSortBy = (state: RootState) => state.filters.sortBy;


// --- Selector to Format Filters for API ---
export const selectApiFormattedFilters = (state: RootState): FetchPropertiesPayload => {
    const filters = state.filters;
    const apiFilters: FetchPropertiesPayload = {};

    // Map state values to API query parameter names
    if (filters.category) apiFilters.category = filters.category;
    if (filters.roomType) apiFilters.roomType = filters.roomType; // Add roomType
    if (filters.neighborhood && filters.neighborhood !== 'Any') apiFilters.neighborhood = filters.neighborhood;

    // Use the dropdown string value for rentRange as backend expects it
    if (filters.rentRange) {
        apiFilters.rentRange = filters.rentRange;
    }
    // If using a slider that updates priceRangeValues instead of rentRange string:
    // else if (filters.priceRangeValues[0] > 0 || filters.priceRangeValues[1] < filters.maxPriceForSlider) {
    //     // You might need separate priceMin/priceMax query params if backend doesn't parse the string range from slider values
    //     if (filters.priceRangeValues[0] > 0) apiFilters.priceMin = filters.priceRangeValues[0].toString();
    //     if (filters.priceRangeValues[1] < filters.maxPriceForSlider) apiFilters.priceMax = filters.priceRangeValues[1].toString();
    // }


    if (filters.bedrooms !== '0') apiFilters.bedrooms = filters.bedrooms;
    if (filters.bathrooms !== '0') apiFilters.bathrooms = filters.bathrooms;

    if (filters.amenities.length > 0) {
        apiFilters.amenities = filters.amenities.join(','); // Send as comma-separated string
    }

    if (filters.sqftRange[0] !== null) apiFilters.sqftMin = filters.sqftRange[0].toString();
    if (filters.sqftRange[1] !== null) apiFilters.sqftMax = filters.sqftRange[1].toString();

    // Exclude client-side sorting from API params unless backend supports it
    // if (backend_supports_sorting) apiFilters.sortBy = filters.sortBy;

    return apiFilters;
};

export default filterSlice.reducer;