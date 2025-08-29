import { useState, useEffect } from 'react';
import axios from 'axios';
import { Profile } from '../redux/slices/profileSlice'; // Re-use the Profile type

// Module-level cache. This acts as a simple in-memory cache for the session.
const profileCache = new Map<string, Profile>();

const useListerProfile = (userId: string | null | undefined) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If no userId is provided, do nothing and reset state.
        if (!userId) {
            setProfile(null);
            setIsLoading(false);
            return;
        }

        // 1. Check the cache first
        if (profileCache.has(userId)) {
            setProfile(profileCache.get(userId)!);
            setIsLoading(false);
            return;
        }

        // 2. If not in cache, fetch from API
        const fetchListerProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/profile/public/${userId}`);
                const fetchedProfile = response.data;

                // 3. Update state and cache
                setProfile(fetchedProfile);
                profileCache.set(userId, fetchedProfile);

            } catch (err: any) {
                const errorMessage = err.response?.data?.message || "Could not load lister's profile.";
                console.error("Failed to fetch lister profile:", errorMessage);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListerProfile();

    }, [userId]); // Re-run this effect whenever the userId prop changes

    return { profile, isLoading, error };
};

export default useListerProfile;