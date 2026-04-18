import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"

const initialState = {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
    loading: false,
    error: null
}

export const fetchConnections = createAsyncThunk('connections/fetch', async (token, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/api/user/connections', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return data.success ? data : rejectWithValue(data.message)
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})

const connectionSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        removeConnection: (state, action) => {
            state.connections = state.connections.filter(c => c._id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConnections.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConnections.fulfilled, (state, action) => {
                state.loading = false;
                state.connections = action.payload.connections;
                state.followers = action.payload.followers;
                state.following = action.payload.following;
                state.pendingConnections = action.payload.pendingConnections;
            })
            .addCase(fetchConnections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
})

export const { removeConnection } = connectionSlice.actions;
export default connectionSlice.reducer;
