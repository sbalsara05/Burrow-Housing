/**
 * Amenities shown when creating/editing listings and in search filters.
 * Backend `propertyModel` enum must include every value here plus any legacy strings still in the DB.
 */
export const PROPERTY_AMENITIES = [
    "Furnished",
    "Utilities included",
    "A/C & heating",
    "In-unit laundry",
    "Dishwasher",
    "Wi-Fi included",
    "Elevator",
    "Gym or fitness center",
    "Step-free or accessible entrance",
    "Parking available",
    "Bike storage",
    "Balcony or patio",
    "Private bathroom",
    "Pet friendly",
] as const;

export type PropertyAmenity = (typeof PROPERTY_AMENITIES)[number];
