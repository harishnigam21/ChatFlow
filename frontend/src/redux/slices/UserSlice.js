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
    otherUsers: null,
    request: null,
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
    setOtherUser: (state, action) => {
      state.otherUsers = action.payload.data;
    },
    setRequest: (state, action) => {
      state.request = action.payload.data;
    },
    addRequest: (state, action) => {
      state.request.push(action.payload.data);
    },
    deleteRequest: (state, action) => {
      const id = action.payload.toString();
      state.request = state.request.filter((item) => item._id != id);
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
      if (currentUser) {
        state.relativeUsers.user = currentUser.map((usr) => {
          if (usr._id == action.payload.id) {
            return { ...usr, lastOnline: action.payload.time };
          }
          return usr;
        });
      }
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
    addFollowers: (state, action) => {
      const id = action.payload;
      if (state.userInfo.followers) {
        state.userInfo.followers.push(id);
      }
      const user = state.otherUsers.find((usr) => usr._id == id);
      const other = state.relativeUsers.user.find((usr) => usr._id == id);

      if (user && !other) {
        if (!state.relativeUsers.user) state.relativeUsers.user = [];
        state.relativeUsers.user.push({
          _id: user._id,
          pic: user.pic || null,
          name: user.name,
        });
      }
    },
    addFollowing: (state, action) => {
      const id = action.payload;
      if (state.userInfo.following) {
        state.userInfo.following.push(id);
      }
      const user = state.otherUsers.find((usr) => usr._id == id);
      const other = state.relativeUsers.user.find((usr) => usr._id == id);
      if (user && !other) {
        if (!state.relativeUsers.user) state.relativeUsers.user = [];
        state.relativeUsers.user.push({
          _id: user._id,
          pic: user.pic || null,
          name: user.name,
        });
      }
    },
    removeFollowers: (state, action) => {
      const id = action.payload;
      if (state.userInfo.followers) {
        state.userInfo.followers = state.userInfo.followers.filter(
          (itemId) => itemId !== id,
        );
      }
      if (!state.relativeUsers.user) state.relativeUsers.user = [];
      state.relativeUsers.user = state.relativeUsers.user.filter(
        (usr) => usr._id != id,
      );
    },
    removeFollowing: (state, action) => {
      const id = action.payload;
      if (state.userInfo.following) {
        state.userInfo.following = state.userInfo.following.filter(
          (itemId) => itemId !== id,
        );
      }
      if (!state.relativeUsers.user) state.relativeUsers.user = [];
      state.relativeUsers.user = state.relativeUsers.user.filter(
        (usr) => usr._id != id,
      );
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
  setOtherUser,
  setRequest,
  addRequest,
  addFollowers,
  addFollowing,
  removeFollowers,
  removeFollowing,
  deleteRequest,
} = UserSlice.actions;
export default UserSlice.reducer;
