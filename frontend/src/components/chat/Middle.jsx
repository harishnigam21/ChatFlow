import { useDispatch, useSelector } from "react-redux";
import { media } from "../../assets/data/media.js";
import useApi from "../../hooks/Api.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  setMessages,
  setSelectedUser,
} from "../../redux/slices/SelectedUserSlice.js";

import toast from "react-hot-toast";
import BouncingLoading from "../common/BouncingLoading.jsx";
import readMedia from "../../utils/read.js";
import { useTimeAgo } from "../../hooks/useTimeAgo.jsx";
import { relativeLastMessage } from "../../redux/slices/UserSlice.js";
import Profile from "./sideMenu/Profile.jsx";
import Setting from "./sideMenu/Setting.jsx";
import YearMessage from "./message/YearMessage.jsx";
import Emoji from "../common/Emoji.jsx";
import { validateInput } from "../../utils/CommonValidation.js";
import axios from "axios";
import { saveToDB } from "../../utils/indexedDB.js";
export default function Middle({
  setInfo,
  setBar,
  relativeLoading,
  inputId,
  selectedUser,
  toShow,
  setToShow,
}) {
  const lastOnlineTime = useTimeAgo(selectedUser?.lastOnline);
  const onlineUsers = useSelector((store) => store.user.onlineUsers);
  const { sendRequest, loading } = useApi();
  const dispatch = useDispatch();
  const scrollToRef = useRef(null);
  const messages = useSelector((store) => store.selectedUser.messages);
  const [msg, setMsg] = useState("");
  const [image, setImage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const Validation = () => {
    if (
      image &&
      image instanceof File &&
      validateInput("image", image, "photo")
    )
      return false;
    console.log("Message Validation done");
    return true;
  };

  const sendMessage = async (id) => {
    if (!Validation()) {
      return;
    }
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
    ).then(async (result) => {
      if (result && result.success) {
        if (result.data.data.image) {
          const res = await axios.get(result.data.data.image, {
            responseType: "blob",
          });
          await saveToDB(result.data.data.image, res.data);
        }
        dispatch(setMessages({ data: result.data.data }));
        dispatch(
          relativeLastMessage({
            data: result.data.data,
            id: selectedUser._id,
          }),
        );
        setMsg("");
        setImage(null);
      } else {
        toast.error(result.data.message);
      }
    });
  };
  const previewUrl = useMemo(() => {
    if (!image) return null;
    return URL.createObjectURL(image);
  }, [image]);
  return !relativeLoading ? (
    toShow == "profile" ? (
      <Profile setToShow={setToShow} />
    ) : toShow == "setting" ? (
      <Setting setToShow={setToShow} />
    ) : selectedUser ? (
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
        {/* chat body //TODO : Unable to handle this chat box, when height is small */}
        <article className="flex justify-end-safe flex-col gap-4 grow p-4 h-100 overflow-y-scroll">
          {messages && Object.keys(messages).length > 0 ? (
            Object.entries(messages)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([year, dates], index) => (
                <YearMessage
                  key={`selectedUser/year/message/${index}`}
                  year={year}
                  dates={dates}
                  selectedUser={selectedUser}
                />
              ))
          ) : (
            <section className="w-full h-full hidden md:flex items-center justify-center">
              <SimpleNotify message={"Start Chatting Now!"} />
            </section>
          )}
          <div ref={scrollToRef}></div>
        </article>
        {/* interaction part */}
        <div className="flex flex-col justify-center relative">
          <Emoji setMessage={setMsg} showPicker={showPicker} />
        </div>
        <article className="flex flex-col justify-center gap-4 my-2 px-2">
          {/* 1st row */}
          {image && (
            <div className="relative self-center aspect-square w-50 rounded-md overflow-hidden">
              <media.ImCross
                className="absolute top-2 right-2 cursor-pointer text-xl text-red-500"
                onClick={() => setImage(null)}
              />
              <img
                src={previewUrl}
                alt="uploaded image"
                className="w-full h-full object-center object-cover"
              />
            </div>
          )}
          {/* 2nd row`` */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center w-full px-4 rounded-full backdrop-blur-sm overflow-hidden border border-border/20">
              <media.MdOutlineEmojiEmotions
                className="text-2xl cursor-pointer"
                onClick={() => setShowPicker((prev) => !prev)}
              />
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
