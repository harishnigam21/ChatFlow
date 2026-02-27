import { useEffect, useRef, useState } from "react";
import Left from "./Left";
import Middle from "./Middle";
import Right from "./Right";
import { useDispatch, useSelector } from "react-redux";
import useApi from "../../hooks/Api";
import {
  incrementUnseenMessage,
  makeSeen,
  relativeUnseenTime,
  setConnectionStatus,
  setLoginStatus,
  setOnlineUser,
  setUser,
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
          } else {
            dispatch(incrementUnseenMessage(newMessage.sender_id));
          }
        });
        socket.on("someMessageSeen", (id) => {
          dispatch(updateMessage(id));
        });
        socket.on("allMessageSeen", (id) => {
          dispatch(updateAllMessage(id));
        });
        socket.on("disconnect", () => {
          toast.error("Connection Disestablish !");
          dispatch(setConnectionStatus(false));
        });
        return () => {
          socket.off("connect");
          socket.off("getOnlineUsers");
          socket.off("newMessage");
          socket.off("someMessageSeen");
          socket.off("allMessageSeen");
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
    dispatch(setSelectedUser({ data: usr }));
    await relativeRequest(`api/message/relative/${usr._id}`).then((result) => {
      if (result && result.success) {
        dispatch(addMessages({ data: result.data.data }));
        dispatch(makeSeen(usr._id));
      }
    });
  };
  useEffect(() => {
    if (onChat.current) {
      onChat.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  return show ? (
    width >= 768 ? (
      <section
        className={`relative grid ${bar ? "md:grid-cols-[40%_60%]" : "md:grid-cols-[0%_100%]"} h-[75dvh] w-[98dvw] md:w-[95dvw] xl:w-[75dvw] border-2 border-border/25 rounded-xl m-5 overflow-hidden`}
      >
        <Left
          bar={bar}
          selectedUser={selectedUser}
          getRelativeMessage={getRelativeMessage}
        />
        <Middle
          selectedUser={selectedUser}
          setInfo={setInfo}
          setBar={setBar}
          relativeLoading={relativeLoading}
          inputId={"web"}
        />
        {selectedUser && info && (
          <Right selectedUser={selectedUser} setInfo={setInfo} />
        )}
      </section>
    ) : (
      <section
        ref={onChat}
        className="relative rounded-xl overflow-hidden w-full h-screen"
      >
        <div
          className={`absolute min-w-full h-full left-0 ${selectedUser ? "opacity-0" : "opacity-100"}`}
        >
          <Left
            bar={bar}
            selectedUser={selectedUser}
            getRelativeMessage={getRelativeMessage}
          />
        </div>
        {selectedUser && (
          <div className="absolute w-full h-full right-0">
            <Middle
              selectedUser={selectedUser}
              setInfo={setInfo}
              setBar={setBar}
              relativeLoading={relativeLoading}
              inputId={"mob"}
            />
            {selectedUser && info && (
              <Right selectedUser={selectedUser} setInfo={setInfo} />
            )}
          </div>
        )}
      </section>
    )
  ) : (
    <Loading />
  );
}
