import { useEffect, useRef, useState } from "react";
import Left from "./Left";
import Middle from "./Middle";
import Right from "./Right";
import { useDispatch, useSelector } from "react-redux";
import useApi from "../../hooks/Api";
import {
  addRequest,
  deleteRequest,
  incrementUnseenMessage,
  makeSeen,
  relativeLastMessage,
  relativeLastMessageSeen,
  relativeLastMessageSeenPro,
  relativeUnseenTime,
  setConnectionStatus,
  setLoginStatus,
  setOnlineUser,
  setRelativeUserLastMessage,
  setUser,
  addFollowing,
  removeFollowers,
  decrementUnseenMessage,
} from "../../redux/slices/UserSlice";
import { getSocket } from "../../socket/socket";
import toast from "react-hot-toast";
import Loading from "../common/Loading";
import {
  addMessages,
  setMessages,
  setSelectedUser,
  updateAllMessage,
  updateMessage,
  updateOnlineTime,
} from "../../redux/slices/SelectedUserSlice";
import useScreenSize from "../../hooks/screenSize";
import { cleanupExpiredMedia } from "../../utils/indexedDB";
export default function Main() {
  const { width } = useScreenSize();
  const connected = useSelector((store) => store.user.connected);
  const selectedUser = useSelector((store) => store.selectedUser.user);
  const onlineUsers = useSelector((store) => store.user.onlineUsers);
  const { sendRequest: refreshRequest, loading: refreshLoading } = useApi();
  const { sendRequest: relativeRequest, loading: relativeLoading } = useApi();
  const { sendRequest: markRequest } = useApi();
  const [show, setShow] = useState(false);
  const [info, setInfo] = useState(false);
  const [bar, setBar] = useState(true);
  const dispatch = useDispatch();
  const selectedUserRef = useRef(selectedUser);
  const onlineUserRef = useRef(onlineUsers);
  const onChat = useRef(null);
  const [toShow, setToShow] = useState(null);
  useEffect(() => {
    setShow(false);
    refreshRequest("api/auth/refresh", "GET").then((result) => {
      if (result && result.success) {
        setShow(true);
        dispatch(setUser({ data: result.data.data }));
        dispatch(setLoginStatus({ data: true }));
        window.localStorage.setItem("acTk", JSON.stringify(result.data.actk));
        const socket = getSocket(connected, result.data.data._id);
        socket.connect();
        socket.on("connect", () => {
          toast.success("Connection Established.");
          dispatch(setConnectionStatus(true)); // Just sending a boolean to Redux
        });
        socket.on("getOfflineUser", (userId) => {
          const selected = selectedUserRef.current;
          const newDate = new Date().toISOString();
          if (selected && selected._id == userId) {
            dispatch(updateOnlineTime(newDate));
          } else {
            dispatch(relativeUnseenTime({ id: userId, time: newDate }));
          }
        });
        socket.on("getOnlineUsers", (userIds) => {
          dispatch(setOnlineUser({ data: userIds }));
        });
        socket.on("newMessage", (newMessage) => {
          const selected = selectedUserRef.current;
          if (selected && selected._id == newMessage.sender_id) {
            const updateMessage = { ...newMessage, seen: true };
            markRequest(`api/message/mark/${newMessage._id}`, "PATCH");
            dispatch(setMessages({ data: updateMessage }));
            dispatch(
              relativeLastMessage({
                data: updateMessage,
                id: newMessage.sender_id,
              }),
            );
          } else {
            dispatch(incrementUnseenMessage(newMessage.sender_id));
            dispatch(
              relativeLastMessage({
                data: newMessage,
                id: newMessage.sender_id,
              }),
            );
          }
        });
        socket.on("someMessageSeen", (id) => {
          dispatch(updateMessage(id));
          dispatch(
            relativeLastMessageSeen({
              id: selectedUserRef.current._id,
              msgId: id,
            }),
          );
        });
        socket.on("allMessageSeen", (id) => {
          dispatch(updateAllMessage(id));
          dispatch(relativeLastMessageSeenPro(id));
        });
        socket.on("newRequest", (request) => {
          toast.success(
            `New follow request arrived from \n ${request.sender_id.name}`,
          );
          dispatch(addRequest({ data: request }));
        });
        socket.on("newContact", (contact) => {
          toast.success(`Follow request accepted by \n ${contact.by}`);
          dispatch(addFollowing(contact.receiver_id));
          dispatch(deleteRequest(contact.id));
        });
        socket.on("rejectRequest", (reject) => {
          toast.error(`Follow request rejected by \n ${reject.by}`);
          dispatch(deleteRequest(reject.id));
        });
        socket.on("unfollow", (unfollow) => {
          toast.error(`${unfollow.by} unFollowed you`);
          dispatch(removeFollowers(unfollow.id));
        });
        socket.on("deleteMessage", (data) => {
          dispatch(
            decrementUnseenMessage({ id: data.id, count: data.count }),
          );
          dispatch(
            relativeLastMessage({
              data: data.updateLast,
              id: data.id,
            }),
          );
        });
        socket.on("disconnect", () => {
          toast.error("Connection Disestablish !");
          dispatch(setConnectionStatus(false));
        });
        return () => {
          socket.off("connect");
          socket.off("getOnlineUsers");
          socket.off("getOfflineUser");
          socket.off("newMessage");
          socket.off("someMessageSeen");
          socket.off("allMessageSeen");
          socket.off("newRequest");
          socket.off("newContact");
          socket.off("rejectRequest");
          socket.off("deleteMessage");
          socket.off("disconnect");
          socket.disconnect();
        };
      }
    });
  }, [dispatch, refreshRequest]);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);
  useEffect(() => {
    onlineUserRef.current = onlineUsers;
  }, [onlineUsers]);
  const getRelativeMessage = async (usr) => {
    setInfo(false);
    dispatch(setSelectedUser({ data: usr }));
    await relativeRequest(`api/message/relative/${usr._id}`).then((result) => {
      if (result && result.success) {
        setToShow(null);
        dispatch(addMessages({ data: result.data.data }));
        dispatch(makeSeen(usr._id));
        const data = result.data.data;
        const length = data.length;
        const select = data[length - 1];
        if (length > 0) {
          dispatch(
            setRelativeUserLastMessage({
              id: usr._id,
              data: { ...select, seen: true },
            }),
          );
        }
      }
    });
  };
  useEffect(() => {
    if (onChat.current) {
      onChat.current.scrollIntoView({ behavior: "smooth" });
    }
    const cleanIndexDB = async () => {
      await cleanupExpiredMedia("media");
    };
    cleanIndexDB();
  }, []);
  return show ? (
    <section className="w-screen h-screen flex justify-center-safe items-center-safe in box-border">
      {width >= 768 ? (
        <article
          className={`relative grid ${bar ? "md:grid-cols-[40%_60%]" : "md:grid-cols-[0%_100%]"} w-[95%] lg:w-[80%] xl:w-[70%] h-[90%] border-2 border-border/25 rounded-xl overflow-hidden z-40`}
        >
          <Left
            bar={bar}
            selectedUser={selectedUser}
            getRelativeMessage={getRelativeMessage}
            setToShow={setToShow}
          />
          <Middle
            selectedUser={selectedUser}
            setInfo={setInfo}
            setBar={setBar}
            relativeLoading={relativeLoading}
            toShow={toShow}
            setToShow={setToShow}
            inputId={"web"}
          />
          {selectedUser && info && (
            <Right selectedUser={selectedUser} setInfo={setInfo} />
          )}
        </article>
      ) : (
        <article
          ref={onChat}
          className="relative rounded-xl overflow-hidden w-full h-screen z-40"
        >
          <div
            className={`absolute min-w-full h-full left-0 ${selectedUser || toShow ? "opacity-0" : "opacity-100"}`}
          >
            <Left
              bar={bar}
              selectedUser={selectedUser}
              getRelativeMessage={getRelativeMessage}
              setToShow={setToShow}
            />
          </div>
          {(selectedUser || toShow) && (
            <div className="absolute w-full h-full right-0">
              <Middle
                selectedUser={selectedUser}
                setInfo={setInfo}
                setBar={setBar}
                relativeLoading={relativeLoading}
                toShow={toShow}
                setToShow={setToShow}
                inputId={"mob"}
              />
              {selectedUser && info && (
                <Right selectedUser={selectedUser} setInfo={setInfo} />
              )}
            </div>
          )}
        </article>
      )}
    </section>
  ) : (
    <Loading />
  );
}
