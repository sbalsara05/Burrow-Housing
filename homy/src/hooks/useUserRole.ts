import { useSelector } from 'react-redux';

export const useUserRole = () => {
    const { user } = useSelector((state) => state.auth);
    const { userPropertyIds } = useSelector((state) => state.properties);
    
    // Automatically determine if user is a lister based on properties
    const hasProperties = userPropertyIds && userPropertyIds.length > 0;
    const hasListingsFlag = user?.hasListings || false;
    const isLister = hasProperties || hasListingsFlag || (user?.listingCount && user.listingCount > 0);
    const isSeeker = !isLister; // If not a lister, they're a property seeker
    
    // Permissions based on role
    const canListProperties = true; // Anyone can list properties
    const canContactListers = true; // Anyone can contact listers
    const canReceiveContacts = isLister; // Only listers receive contact requests
    
    // Helper function to check if user owns a specific property
    const isPropertyOwner = (propertyUserId) => {
        if (!user) return false;
        return user._id === propertyUserId || user.id === propertyUserId;
    };
    
    // Helper function to check if user can contact about a specific property
    const canContactAboutProperty = (propertyUserId) => {
        if (!user) return false;
        return !isPropertyOwner(propertyUserId); // Can't contact yourself
    };
    
    return {
        // User data
        user,
        
        // Role flags
        isLister,
        isSeeker,
        hasProperties,
        
        // Permissions
        canListProperties,
        canContactListers,
        canReceiveContacts,
        
        // Utility functions
        isPropertyOwner,
        canContactAboutProperty,
        
        // Descriptive data
        userType: isLister ? 'lister' : 'seeker',
        propertyCount: userPropertyIds?.length || user?.listingCount || 0,
        
        // Role description for UI
        roleDescription: isLister ? 'Property Owner' : 'Property Seeker',
        roleBadgeColor: isLister ? 'success' : 'primary',
    };
};