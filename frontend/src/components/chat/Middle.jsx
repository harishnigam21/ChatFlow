import { useDispatch, useSelector } from "react-redux";
import { media } from "../../assets/data/media.js";
import useApi from "../../hooks/Api.jsx";
import { useEffect, useRef, useState } from "react";
import {
  setMessages,
  setSelectedUser,
} from "../../redux/slices/SelectedUserSlice.js";

import toast from "react-hot-toast";
import BouncingLoading from "../common/BouncingLoading.jsx";
import readMedia from "../../utils/read.js";
import { separateTime } from "../../utils/getDate.js";
import { useTimeAgo } from "../../hooks/useTimeAgo.jsx";
import { relativeLastMessage } from "../../redux/slices/UserSlice.js";
export default function Middle({
  setInfo,
  setBar,
  relativeLoading,
  inputId,
  selectedUser,
}) {
  const lastOnlineTime = useTimeAgo(selectedUser?.lastOnline);
  const onlineUsers = useSelector((store) => store.user.onlineUsers);
  const { sendRequest, loading } = useApi();
  const dispatch = useDispatch();
  const scrollToRef = useRef(null);
  const messages = useSelector((store) => store.selectedUser.messages);
  const [msg, setMsg] = useState("");
  const [image, setImage] = useState(null);
  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (id) => {
    if (!id || !msg || msg.trim().length == 0) {
      if (!image) {
        toast.error("Oops Invalid Message !");
        return;
      }
    }
    let baseImage = null;
    if (image) {
      baseImage = await readMedia(image);
    }
    await sendRequest(
      `api/message/to/${id}`,
      "POST",
      { message: msg, image: baseImage },
      {},
      false,
    ).then((result) => {
      if (result && result.success) {
        dispatch(setMessages({ data: result.data.data }));
        dispatch(
          relativeLastMessage({
            data: result.data.data,
            id: selectedUser._id,
          }),
        );
        setMsg("");
        setImage(null);
      }
    });
  };
  return !relativeLoading ? (
    selectedUser ? (
      <section className="flex flex-col h-full text-text transition-all">
        <article className="flex sticky top-0 items-center justify-between p-4 backdrop-blur-sm">
          <div className="flex gap-2 items-center">
            <media.BsChevronCompactLeft
              className="text-2xl cursor-pointer"
              onClick={() => {
                dispatch(setSelectedUser({ data: null }));
                setBar(true);
              }}
            />
            <div className="flex flex-col justify-center h-10">
              <h3 className="text-xl">{selectedUser.name}</h3>
              {onlineUsers.includes(selectedUser._id) ? (
                <small className="text-green-500">online</small>
              ) : (
                <small>seen, {lastOnlineTime}</small>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <media.MdFullscreenExit
              className="text-3xl cursor-pointer"
              onClick={() => setBar((prev) => !prev)}
            />
            <media.LuBadgeInfo
              className="text-2xl cursor-pointer"
              onClick={() => setInfo((prev) => !prev)}
            />
          </div>
        </article>
        <hr className="w-full border border-border/20" />
        {/* chat body */}
        <article className="flex justify-end-safe flex-col gap-4 grow p-4 h-100 overflow-y-scroll">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) =>
              msg.receiver_id == selectedUser._id ? (
                <div
                  key={`selectedUser/message/${index}`}
                  className=" rounded-[0px_10px_10px_10px] flex flex-col bg-secondary/80 text-black min-w-30 max-w-[50%] wrap-anywhere you self-start"
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      className="object-center object-cover w-80 rounded-tr-md"
                      alt="user uploaded image"
                    />
                  )}
                  <div className="flex gap-2">
                    <p className="wrap-anywhere p-1 pl-2">{msg.message}</p>
                    <small className="text-[10px] grow text-right flex flex-nowrap items-end justify-end gap-1">
                      {separateTime(msg.createdAt)}
                      {msg.seen ? (
                        <media.BiCheckDouble className="text-base text-blue-700" />
                      ) : onlineUsers?.includes(selectedUser._id) ? (
                        <media.BiCheckDouble className="text-base" />
                      ) : (
                        <media.BiCheck className="text-base" />
                      )}
                    </small>
                  </div>
                </div>
              ) : (
                <div
                  key={`selectedUser/message/${index}`}
                  className="rounded-[10px_0px_10px_10px] flex flex-col bg-secondary/80 text-black min-w-30 max-w-[50%] wrap-anywhere me self-end"
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      className="object-center object-cover w-100 rounded-tl-md"
                      alt="user uploaded image"
                    />
                  )}
                  <div className="flex gap-2">
                    <p className="wrap-anywhere p-1 pl-2">{msg.message}</p>
                    <small className="text-[10px] grow text-right flex flex-nowrap items-end justify-end gap-1 pr-1">
                      {separateTime(msg.createdAt)}{" "}
                    </small>
                  </div>
                </div>
              ),
            )
          ) : (
            <section className="w-full h-full hidden md:flex items-center justify-center">
              <SimpleNotify message={"Start Chatting Now!"} />
            </section>
          )}
          <div ref={scrollToRef}></div>
        </article>
        {/* interaction part */}
        <article className="flex flex-col justify-center gap-4 my-2 px-2">
          {/* 1st row */}
          {image && (
            <div className="relative self-center aspect-square w-50 rounded-md overflow-hidden">
              <media.ImCross
                className="absolute top-2 right-2 cursor-pointer text-xl text-red-500"
                onClick={() => setImage(null)}
              />
              <img
                src={URL.createObjectURL(image)}
                alt="uploaded image"
                className="w-full h-full object-center object-cover"
              />
            </div>
          )}
          {/* 2nd row`` */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center w-full px-4 rounded-full backdrop-blur-sm overflow-hidden border border-border/20">
              <media.MdOutlineEmojiEmotions className="text-2xl cursor-pointer" />
              <input
                type="text"
                name="message"
                id={`message/${inputId}`}
                value={msg}
                placeholder="Send a message"
                className="py-2 px-4 focus:outline-none w-full grow"
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key == "Enter" && !loading) {
                    sendMessage(selectedUser._id);
                  }
                }}
              />
              <div>
                <label htmlFor={`messageimage/${inputId}`}>
                  <media.FaImage className="text-2xl cursor-pointer" />
                </label>
                <input
                  type="file"
                  name="messageimage"
                  id={`messageimage/${inputId}`}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp,image/jpg"
                  onChange={(e) => {
                    console.log(e.target.files);
                    setImage(e.target.files[0]);
                  }}
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="cursor-pointer rounded-full aspect-square p-2 bg-linear-to-tr from-primary to-secondary"
              onClick={() => sendMessage(selectedUser._id)}
            >
              {loading ? (
                <p className="spinner"></p>
              ) : (
                <media.MdSend className="text-xl aspect-square w-5 h-5 -rotate-40 pb-0.5 pl-0.5 text-black" />
              )}
            </button>
          </div>
        </article>
      </section>
    ) : (
      <section className="w-full h-full hidden md:flex items-center justify-center bg-bgprimary/50">
        <SimpleNotify message={"Chat anytime, anywhere"} />
      </section>
    )
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-bgprimary/60 backdrop-blur-xl">
      <BouncingLoading />
    </div>
  );
}

export const SimpleNotify = ({ message }) => {
  return (
    <div className="flex flex-col justify-center items-center text-text">
      <img src={media.LGL} alt="logo" className="w-20 h-20" />
      <p>{message}</p>
    </div>
  );
};
