import { createSlice } from "@reduxjs/toolkit";
const UserSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: null,
    relativeUsers: {
      user: null,
      unseen: null,
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
} = UserSlice.actions;
export default UserSlice.reducer;
