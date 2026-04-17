import { createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast"


const initialState = {
    value: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
    const { data } = await api.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
    })
    return data.success ? data.user : null
})

export const updateUser = createAsyncThunk('user/update', async ({ userData, token }) => {
    const { data } = await api.post('/api/user/update', userData, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (data.success) {
        toast.success(data.message)
        return data.user
    } else {
        toast.error(data.message)
        return null
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {

    }
})

export default userSlice.reducer