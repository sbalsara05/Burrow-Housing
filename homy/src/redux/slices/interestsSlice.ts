import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import type { RootState } from './store'

export interface Interest {
  _id: string
  propertyId: any
  listerId: any
  renterId: any
  message: string
  moveInDate: string
  status: 'pending' | 'approved' | 'declined' | 'withdrawn'
  streamChannelId?: string
  createdAt: string
}

const API_URL = 'http://burrowhousing.com/api'

interface InterestsState {
  receivedInterests: Interest[]
  sentInterests: Interest[]
  isLoading: boolean
  error: string | null
}

const initialState: InterestsState = {
  receivedInterests: [],
  sentInterests: [],
  isLoading: false,
  error: null,
}

export const fetchReceivedInterests = createAsyncThunk<
  Interest[],
  void,
  { state: RootState }
>(
  'interests/fetchReceived',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      if (!token) {
        return rejectWithValue('Not authenticated.')
      }
      const res = await axios.get(`${API_URL}/interests/received`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = Array.isArray(res.data) ? res.data : (res.data?.interests ?? [])
      return data as Interest[]
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch received interests.')
    }
  }
)

export const fetchSentInterests = createAsyncThunk<
  Interest[],
  void,
  { state: RootState }
>(
  'interests/fetchSent',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      if (!token) {
        return rejectWithValue('Not authenticated.')
      }
      const res = await axios.get(`${API_URL}/interests/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = Array.isArray(res.data) ? res.data : (res.data?.interests ?? [])
      return data as Interest[]
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch sent interests.')
    }
  }
)

/**
 * Withdraw an interest (remove/cancel a sent request)
 * Adjust the endpoint if your backend uses a different route.
 */
export const withdrawInterest = createAsyncThunk<
  string,
  string,
  { state: RootState }
>(
  'interests/withdraw',
  async (interestId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      if (!token) {
        return rejectWithValue('Not authenticated.')
      }
      await axios.delete(`${API_URL}/interests/${interestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return interestId
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to withdraw interest.')
    }
  }
)

const interestsSlice = createSlice({
  name: 'interests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Received
      .addCase(fetchReceivedInterests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReceivedInterests.fulfilled, (state, action: PayloadAction<Interest[]>) => {
        state.isLoading = false
        state.receivedInterests = action.payload ?? []
      })
      .addCase(fetchReceivedInterests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.receivedInterests = []
      })

      // Sent
      .addCase(fetchSentInterests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSentInterests.fulfilled, (state, action: PayloadAction<Interest[]>) => {
        state.isLoading = false
        state.sentInterests = action.payload ?? []
      })
      .addCase(fetchSentInterests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.sentInterests = []
      })

      // Withdraw
      .addCase(withdrawInterest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(withdrawInterest.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        const id = action.payload
        state.sentInterests = state.sentInterests.filter(i => i._id !== id)
        state.receivedInterests = state.receivedInterests.filter(i => i._id !== id)
      })
      .addCase(withdrawInterest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const selectReceivedInterests = (state: RootState) =>
  state.interests?.receivedInterests || []

export const selectSentInterests = (state: RootState) =>
  state.interests?.sentInterests || []

export const selectInterestsLoading = (state: RootState) =>
  state.interests?.isLoading || false

export const selectInterestsError = (state: RootState) =>
  state.interests?.error || null

export default interestsSlice.reducer