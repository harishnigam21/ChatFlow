import { createSlice } from "@reduxjs/toolkit";
const SelectedUserSlice = createSlice({
  name: "selected_user",
  initialState: {
    user: null,
    messages: [],
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.user = action.payload.data;
    },
    setMessages: (state, action) => {
      state.messages = [...state.messages, action.payload.data];
    },
    addMessages: (state, action) => {
      state.messages = action.payload.data;
    },
    updateMessage: (state, action) => {
      const currentMessages = state.messages;
      state.messages = currentMessages.map((msg) => {
        if (msg._id == action.payload) {
          return { ...msg, seen: true };
        }
        return msg;
      });
    },
    updateAllMessage: (state, action) => {
      const currentMessages = state.messages;
      state.messages = currentMessages.map((msg) => {
        if (msg.seen == false && msg.receiver_id == action.payload) {
          return { ...msg, seen: true };
        }
        return msg;
      });
    },
    updateOnlineTime: (state, action) => {
      state.user = { ...state.user, lastOnline: action.payload };
    },
  },
});
export const {
  setSelectedUser,
  setMessages,
  addMessages,
  updateMessage,
  updateAllMessage,
  updateOnlineTime,
} = SelectedUserSlice.actions;
export default SelectedUserSlice.reducer;
