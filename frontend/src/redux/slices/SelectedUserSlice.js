import { createSlice } from "@reduxjs/toolkit";
import { formatDate } from "../../utils/getDate";
import { all } from "axios";
const SelectedUserSlice = createSlice({
  name: "selected_user",
  initialState: {
    user: null,
    messages: {},
    media: null,
    messageToDelete: [],
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.user = action.payload.data;
    },
    setMessages: (state, action) => {
      const message = action.payload.data;
      if (message) {
        const date = formatDate(message.createdAt);
        const year = date.slice(-4);
        if (!state.messages[year]) {
          state.messages[year] = {};
        }
        if (!state.messages[year][date]) {
          state.messages[year][date] = [];
        }
        state.messages[year][date].push(message);
      }
    },
    addMessages: (state, action) => {
      state.messages = action.payload.data;
    },
    updateMessage: (state, action) => {
      state.messages = Object.entries(state.messages).reduce(
        (acc, [year, dates]) => {
          const updatedDates = Object.entries(dates).reduce(
            (dateAcc, [date, messages]) => {
              const updatedMessages = messages.map((msg) =>
                msg._id === action.payload ? { ...msg, seen: true } : msg,
              );
              dateAcc[date] = updatedMessages;
              return dateAcc;
            },
            {},
          );

          acc[year] = updatedDates;
          return acc;
        },
        {},
      );
    },
    updateAllMessage: (state, action) => {
      state.messages = Object.entries(state.messages).reduce(
        (acc, [year, dates]) => {
          const updatedDates = Object.entries(dates).reduce(
            (dateAcc, [date, messages]) => {
              const updatedMessages = messages.map((msg) =>
                msg.seen == false && msg.receiver_id == action.payload
                  ? { ...msg, seen: true }
                  : msg,
              );
              dateAcc[date] = updatedMessages;
              return dateAcc;
            },
            {},
          );

          acc[year] = updatedDates;
          return acc;
        },
        {},
      );
    },
    updateOnlineTime: (state, action) => {
      state.user = { ...state.user, lastOnline: action.payload };
    },
    setMedia: (state, action) => {
      state.media = action.payload.data;
    },
    pushMessageToDelete: (state, action) => {
      state.messageToDelete.push(action.payload);
    },
    popMessageToDelete: (state, action) => {
      const data = state.messageToDelete;
      state.messageToDelete = data.filter((item) => item != action.payload);
    },
    deleteMessages: (state, action) => {
      const ids = action.payload;
      if (ids.length > 0) {
        state.messages = Object.entries(state.messages).reduce(
          (acc, [year, dates]) => {
            const updatedDates = Object.entries(dates).reduce(
              (dateAcc, [date, messages]) => {
                const updatedMessages = messages
                  .filter((msg) => {
                    if (ids.includes(msg._id)) {
                      return (
                        msg.seen === false && msg.deletedForEveryone === false
                      );
                    }
                    return true; 
                  })
                  .map((msg) => {
                    if (ids.includes(msg._id)) {
                      if (
                        msg.seen == false &&
                        msg.deletedForEveryone == false
                      ) {
                        const { message, deletedForEveryone, ...other } = msg;
                        const updatedOne = {
                          ...other,
                          deletedForEveryone: true,
                        };
                        return updatedOne;
                      }
                    } else {
                      return msg;
                    }
                  });
                dateAcc[date] = updatedMessages;
                return dateAcc;
              },
              {},
            );

            acc[year] = updatedDates;
            return acc;
          },
          {},
        );
      }
    },
    clearMessageTrash: (state) => {
      state.messageToDelete = [];
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
  setMedia,
  pushMessageToDelete,
  popMessageToDelete,
  deleteMessages,
  clearMessageTrash,
} = SelectedUserSlice.actions;
export default SelectedUserSlice.reducer;
