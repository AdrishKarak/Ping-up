import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    messages: [],
    latestMessage: null,
    showNotification: false
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setLatestMessage: (state, action) => {
            state.latestMessage = action.payload;
            state.showNotification = true;
        },
        clearNotification: (state) => {
            state.showNotification = false;
            state.latestMessage = null;
        }
    }
})

export const { setLatestMessage, clearNotification } = messagesSlice.actions;
export default messagesSlice.reducer;
