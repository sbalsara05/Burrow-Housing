import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store';

const API_URL = 'http://localhost:3000/api';

// --- Interfaces ---
export interface Notification {
    _id: string;
    userId: string;
    type: string;
    message: string;
    isRead: boolean;
    link: string;
    createdAt: string;
    metadata?: any;
}

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    } | null;
}

// --- Initial State ---
const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    status: 'idle',
    pagination: null,
};

// --- Async Thunks ---

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (page: number = 1, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        try {
            const response = await axios.get(`${API_URL}/notifications?page=${page}&limit=15`);
            const unread = response.data.notifications.filter((n: Notification) => !n.isRead).length;
            return { ...response.data, unreadCount: unread };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const markNotificationsAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (_, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        try {
            await axios.post(`${API_URL}/notifications/read`);
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark notifications as read');
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId: string, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        try {
            await axios.delete(`${API_URL}/notifications/${notificationId}`);
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
        }
    }
);

export const clearReadNotifications = createAsyncThunk(
    'notifications/clearRead',
    async (_, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        try {
            await axios.post(`${API_URL}/notifications/clear-read`);
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear notifications');
        }
    }
);

// --- Slice Definition ---
const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearNotificationsState: (state) => {
            Object.assign(state, initialState);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.status = 'loading';
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.status = 'succeeded';
                state.notifications = action.payload.notifications;
                state.pagination = action.payload.pagination;
                state.unreadCount = action.payload.unreadCount;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Mark as Read
            .addCase(markNotificationsAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => n.isRead = true);
                state.unreadCount = 0;
            })
            // Delete Notification
            .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
                const id = action.payload;
                const notification = state.notifications.find(n => n._id === id);
                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications = state.notifications.filter(n => n._id !== id);
            })
            // Clear Read Notifications
            .addCase(clearReadNotifications.fulfilled, (state) => {
                state.notifications = state.notifications.filter(n => !n.isRead);
            });
    },
});

export const { clearNotificationsState } = notificationSlice.actions;

// --- Selectors ---
export const selectAllNotifications = (state: RootState) => state.notifications.notifications;
export const selectUnreadNotificationCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationStatus = (state: RootState) => state.notifications.status;
export const selectNotificationIsLoading = (state: RootState) => state.notifications.isLoading;

export default notificationSlice.reducer;