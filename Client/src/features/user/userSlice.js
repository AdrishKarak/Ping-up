import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import api from "../../api/axios"


const initialState = {
    value: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/api/user/data', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return data.success ? data.user : rejectWithValue(data.message)
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})

export const updateUser = createAsyncThunk('user/update', async ({ userData, token }, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/api/user/update', userData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return data.success ? data.user : rejectWithValue(data.message)
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.value = action.payload
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                if (action.payload) {
                    state.value = action.payload
                }
            })
    }
})

export default userSlice.reducer
