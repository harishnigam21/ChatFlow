import { createSlice } from "@reduxjs/toolkit";
const UserSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: null,
    relativeUsers: {
      user: null,
      unseen: null,
      lastMessages: null,
    },
    onlineUsers: null,
    loginStatus: false,
    connected: false,
  },
  reducers: {
    setUser: (state, action) => {
      const data = action.payload.data;
      state.userInfo = data;
    },
    setLoginStatus: (state, action) => {
      state.loginStatus = action.payload.data;
    },
    setOnlineUser: (state, action) => {
      state.onlineUsers = action.payload.data;
    },
    setRelativeUser: (state, action) => {
      state.relativeUsers = action.payload.data;
    },
    setConnectionStatus: (state, action) => {
      state.connected = action.payload;
    },
    incrementUnseenMessage: (state, action) => {
      if (state.relativeUsers.unseen[action.payload]) {
        state.relativeUsers.unseen[action.payload] += 1;
      } else {
        state.relativeUsers.unseen[action.payload] = 1;
      }
    },
    makeSeen: (state, action) => {
      if (state.relativeUsers.unseen[action.payload]) {
        state.relativeUsers.unseen[action.payload] = 0;
      }
    },
    relativeUnseenTime: (state, action) => {
      const currentUser = state.relativeUsers.user;
      state.relativeUsers.user = currentUser.map((usr) => {
        if (usr._id == action.payload.id) {
          return { ...usr, lastOnline: action.payload.time };
        }
        return usr;
      });
    },
    relativeLastMessage: (state, action) => {
      const current = state.relativeUsers.lastMessages;
      const id = action.payload.id;
      const data = action.payload.data;
      current[id] = data;
    },
    relativeLastMessageSeen: (state, action) => {
      const data = state.relativeUsers.lastMessages[action.payload.id];
      if (data && data._id == action.payload.msgId) {
        data.seen = true;
      }
    },
    relativeLastMessageSeenPro: (state, action) => {
      const data = state.relativeUsers.lastMessages[action.payload];
      if (data) {
        data.seen = true;
      }
    },
    setRelativeUserLastMessage: (state, action) => {
      if (state.relativeUsers.lastMessages[action.payload.id]) {
        state.relativeUsers.lastMessages[action.payload.id] =
          action.payload.data;
      }
    },
  },
});
export const {
  setUser,
  setLoginStatus,
  setConnectionStatus,
  setOnlineUser,
  setRelativeUser,
  incrementUnseenMessage,
  makeSeen,
  relativeUnseenTime,
  relativeLastMessage,
  setRelativeUserLastMessage,
  relativeLastMessageSeen,
  relativeLastMessageSeenPro,
} = UserSlice.actions;
export default UserSlice.reducer;
