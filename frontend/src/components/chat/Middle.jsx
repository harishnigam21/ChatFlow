import { useDispatch, useSelector } from "react-redux";
import { media } from "../../assets/data/media.js";
import useApi from "../../hooks/Api.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearMessageTrash,
  deleteMessages,
  setMessages,
  setSelectedUser,
} from "../../redux/slices/SelectedUserSlice.js";

import toast from "react-hot-toast";
import BouncingLoading from "../common/BouncingLoading.jsx";
import { useTimeAgo } from "../../hooks/useTimeAgo.jsx";
import { relativeLastMessage } from "../../redux/slices/UserSlice.js";
import Profile from "./sideMenu/Profile.jsx";
import Setting from "./sideMenu/Setting.jsx";
import YearMessage from "./message/YearMessage.jsx";
import Emoji from "../common/Emoji.jsx";
import { validateInput } from "../../utils/CommonValidation.js";
import axios from "axios";
import { cleanupOldMedia, saveToDB } from "../../utils/indexedDB.js";
import { separateTime } from "../../utils/getDate.js";
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
  const messages = useSelector((store) => store.selectedUser.messages);
  const messageToDelete = useSelector(
    (store) => store.selectedUser.messageToDelete,
  );
  const { sendRequest: messageKeyRequest } = useApi();
  const { sendRequest: sendMessageRequest } = useApi();
  const { sendRequest: MessageDeleteRequest, loading: MessageDeleteLoading } =
    useApi();
  const dispatch = useDispatch();
  const scrollToRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [mediaToUpload, setMediaToUpload] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [listAttachment, setListAttachment] = useState(false);
  const [sendLoader, setSendLoader] = useState(false);
  const [dummyMessageToShow, setDummyMessageToShow] = useState(false);
  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, dummyMessageToShow]);
  useEffect(() => {
    setListAttachment(false);
    setShowPicker(false);
    setMediaToUpload([]);
    setMsg("");
  }, [selectedUser]);
  const Validation = () => {
    console.log(mediaToUpload);
    if (mediaToUpload && mediaToUpload.length > 0) {
      const hasError = mediaToUpload.some((media) => {
        if (media instanceof File) {
          const type = media.type.split("/")[0];
          return validateInput(type, media, type == "image" ? "photo" : "");
        }
        return false;
      });
      return !hasError;
    }
    return true;
  };

  const sendMessage = async (id) => {
    setSendLoader(true);
    setDummyMessageToShow(true);
    if (!Validation()) {
      setSendLoader(false);
      setDummyMessageToShow(false);
      return;
    }
    if (!id || !msg || msg.trim().length == 0) {
      if (mediaToUpload.length == 0) {
        toast.error("Oops Invalid Message !");
        return;
      }
    }
    const sendMessageAPI = async (media) => {
      await sendMessageRequest(
        `api/message/to/${id}`,
        "POST",
        { message: msg, media },
        {},
        false,
      ).then(async (result) => {
        if (result && result.success) {
          setMsg("");
          setMediaToUpload([]);
          dispatch(setMessages({ data: result.data.data }));
          dispatch(
            relativeLastMessage({
              data: result.data.data,
              id: selectedUser._id,
            }),
          );
          setSendLoader(false);
          setDummyMessageToShow(false);
        } else {
          const errMsg = result?.data?.message || "Failed to send Message";
          toast.error(errMsg);
        }
      });
    };
    try {
      if (mediaToUpload.length > 0) {
        await messageKeyRequest(`api/message/key/${id}`, "GET").then(
          async (result) => {
            const data = result?.data;
            if (result && result.success) {
              const { signature, timestamp, apiKey, cloudName, folder } = data;

              const uploadPromises = Array.from(mediaToUpload).map(
                async (file) => {
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("api_key", apiKey);
                  formData.append("timestamp", timestamp);
                  formData.append("signature", signature);
                  formData.append("tags", "status_pending");
                  formData.append("folder", folder);

                  const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                    { method: "POST", body: formData },
                  );
                  const data = await response.json(); // { secure_url, public_id,resource_type ... }
                  if (response.ok) {
                    const res = await axios.get(data.secure_url, {
                      responseType: "blob",
                    });
                    await cleanupOldMedia("media");
                    await saveToDB(data.secure_url, res.data);
                    return {
                      ...data,
                      name: file.name,
                      lastModified: file.lastModified,
                      size: file.size,
                      type: file.type,
                      tag: file.tag || "",
                    };
                  }
                  toast.error("Failed to upload Media");
                  return;
                },
              );

              try {
                const results = await Promise.all(uploadPromises);
                const attachments = results.map((res) => ({
                  url: res.secure_url,
                  public_id: res.public_id,
                  thumbnail: res.secure_url.replace(
                    "/upload/",
                    "/upload/e_blur:1000,q_10,w_200/",
                  ),
                  resource_type: res.type,
                  name: res.name,
                  lastModified: res.lastModified,
                  size: res.size,
                  tag: res.tag,
                }));
                sendMessageAPI(attachments);
              } catch (error) {
                console.error("One or more uploads failed", error);
              }
            } else {
              const errMsg = result?.data?.message || "Failed to send Message";
              toast.error(errMsg);
            }
          },
        );
      } else {
        sendMessageAPI(null);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const previewUrl = useMemo(() => {
    if (mediaToUpload.length > 10) {
      toast.error(
        "Upload limit exceeds (max : 10 at a time), giving priority to first 10",
      );
      setMediaToUpload((prev) => prev.slice(0, 10));
    }
    if (!mediaToUpload || mediaToUpload.length == 0) return null;
    if (mediaToUpload.length == 1) {
      const temp = URL.createObjectURL(mediaToUpload[0]);
      return [
        {
          name: mediaToUpload[0].name,
          type: mediaToUpload[0].type,
          url: temp,
        },
      ];
    } else {
      const temp = mediaToUpload.map((item) => ({
        name: item.name,
        type: item.type,
        url: URL.createObjectURL(item),
      }));
      return temp;
    }
  }, [mediaToUpload]);

  const handleMessageDelete = async () => {
    if (messageToDelete.length == 0) {
      toast.error("Please Select Message to delete.");
    }
    await MessageDeleteRequest(
      `api/message/delete/${selectedUser._id}`,
      "PATCH",
      {
        messageIds: messageToDelete,
      },
    ).then((result) => {
      const data = result?.data;
      if (result && result.success) {
        if (data.success) {
          dispatch(
            deleteMessages({
              sender: data?.senderUpdatedIds || [],
              receiver: data?.receiverUpdatedIds || [],
              everyone: data?.deletedForEveryoneIds || [],
            }),
          );
          dispatch(
            relativeLastMessage({
              data: data.updateLast,
              id: selectedUser._id,
            }),
          );
          dispatch(clearMessageTrash());
          toast.success("Successfully deleted Messages");
        }
      } else {
        const errMsg = data?.message || "Failed to delete Message";
        toast.error(errMsg);
      }
    });
  };
  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      const existingFiles = new Set(
        mediaToUpload.map((item) => `${item.name}-${item.lastModified}`),
      );
      const filteredNewFiles = Array.from(e.target.files).filter((item) => {
        const key = `${item.name}-${item.lastModified}`;
        if (!existingFiles.has(key)) {
          return true;
        } else {
          toast.error("Duplicates Files are merged !");
          return false;
        }
      });
      setMediaToUpload((prev) => [...prev, ...filteredNewFiles]);
    }
  };
  return !relativeLoading ? (
    toShow == "profile" ? (
      <Profile setToShow={setToShow} />
    ) : toShow == "setting" ? (
      <Setting setToShow={setToShow} />
    ) : selectedUser ? (
      <section className="flex flex-col h-full text-text transition-all">
        <article className="flex sticky top-0 z-20 items-center justify-between p-4 backdrop-blur-sm">
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
            {messageToDelete.length > 0 && (
              <div className="flex flex-nowrap gap-1 items-center-safe">
                <strong>{messageToDelete.length}</strong>
                <media.MdDelete
                  className={`text-xl text-red-600 ${MessageDeleteLoading && "animate-ping"} cursor-pointer`}
                  onClick={handleMessageDelete}
                />
              </div>
            )}
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
        <article className="flex justify-end-safe flex-col gap-4 grow p-4 h-10 overflow-y-scroll">
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
        {dummyMessageToShow && (
          <div className="relative rounded-[0px_10px_10px_10px] flex flex-col bg-secondary/80 min-w-30 h-20 max-w-[50%] animate-pulse"></div>
        )}

        <div className="flex flex-col absolute bottom-15 z-10 justify-center">
          <Emoji
            setMessage={setMsg}
            showPicker={showPicker}
            setShowPicker={setShowPicker}
          />
          {listAttachment && (
            <div
              className="flex flex-col bg-bgprimary self-start-safe absolute bottom-0 border border-border/20 rounded-xl overflow-hidden z-20"
              onMouseLeave={() => setListAttachment(false)}
            >
              <div className="flex gap-2 items-center py-2 px-2 hover:bg-border/20 cursor-pointer transition-all">
                <label
                  htmlFor={`messagedoc/${inputId}`}
                  className="flex gap-2 cursor-grab"
                >
                  <media.IoDocumentText className="text-violet-600" />
                  <small>Document</small>
                </label>
                <input
                  type="file"
                  name="messagedoc"
                  id={`messagedoc/${inputId}`}
                  className="hidden"
                  accept="application/pdf, application/docx,application/doc, application/txt,application/xls,application/xlsx,application/zip,.pdf,.docx,.doc,.txt,.xls,.xlsx,.zip"
                  multiple
                  onChange={(e) => handleFileUpload(e)}
                />
              </div>
              <div className="flex gap-2 items-center py-2 px-2 hover:bg-border/20 cursor-pointer transition-all">
                <label
                  htmlFor={`messageimage/${inputId}`}
                  className="flex gap-2 cursor-grab"
                >
                  <media.FaImage className="text-blue-600" />
                  <small>Photos</small>
                </label>
                <input
                  type="file"
                  name="messageimage"
                  id={`messageimage/${inputId}`}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp,image/jpg"
                  multiple
                  onChange={(e) => handleFileUpload(e)}
                />
              </div>
              <div className="flex gap-2 items-center py-2 px-2 hover:bg-border/20 cursor-pointer transition-all">
                <label
                  htmlFor={`messagevideo/${inputId}`}
                  className="flex gap-2 cursor-grab"
                >
                  <media.FaVideo className="text-indigo-600" />
                  <small>Videos</small>
                </label>
                <input
                  type="file"
                  name="messagevideo"
                  id={`messagevideo/${inputId}`}
                  className="hidden"
                  accept="video/mp4, video/mov, video/avi,video/wmv,video/webm,video/mkv"
                  multiple
                  onChange={(e) => handleFileUpload(e)}
                />
              </div>
              <div className="flex gap-2 items-center py-2 px-2 hover:bg-border/20 cursor-pointer transition-all">
                <label
                  htmlFor={`messagecamera/${inputId}`}
                  className="flex gap-2 cursor-grab"
                >
                  <media.FaCamera className="text-pink-600" />
                  <small>Camera</small>
                </label>
                <input
                  type="file"
                  name="messagecamera"
                  id={`messagecamera/${inputId}`}
                  className="hidden"
                  accept="video/*, image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e)}
                />
              </div>
              <div className="flex gap-2 items-center py-2 px-2 hover:bg-border/20 cursor-pointer transition-all">
                <label
                  htmlFor={`messageaudio/${inputId}`}
                  className="flex gap-2 cursor-grab"
                >
                  <media.MdAudiotrack className="text-orange-600" />
                  <small>Audio</small>
                </label>
                <input
                  type="file"
                  name="messageaudio"
                  id={`messageaudio/${inputId}`}
                  className="hidden"
                  accept="audio/mp3,audio/mpeg"
                  multiple
                  onChange={(e) => handleFileUpload(e)}
                />
              </div>
            </div>
          )}
        </div>
        <article className="flex flex-col justify-center gap-4 my-2 px-2">
          {/* 1st row */}
          <div className="flex gap-4 overflow-x-auto">
            {!dummyMessageToShow &&
              !sendLoader &&
              mediaToUpload &&
              mediaToUpload.length > 0 &&
              previewUrl.map((item, index) => (
                <div
                  key={`uploaded/image/${index}`}
                  className="relative self-center aspect-square w-50 min-w-30 rounded-md overflow-hidden"
                >
                  <media.ImCross
                    className="absolute top-2 right-2 z-1 cursor-pointer text-red-500"
                    onClick={() =>
                      setMediaToUpload((prev) =>
                        prev.filter((inItem) => inItem.name != item.name),
                      )
                    }
                  />
                  {item.type.includes("image") ? (
                    <div className="w-full h-full relative">
                      <img
                        src={item.url}
                        alt="uploaded image"
                        className="w-full h-full object-center object-cover"
                      />
                      <small className="bg-black/80 text-white absolute bottom-1 w-full whitespace-nowrap rounded-full py-1 px-2 overflow-x-auto noscrollbar">
                        {item.name}
                      </small>
                      <div className="bg-black/80 text-white absolute top-0 left-0 rounded-r-full flex items-center justify-center">
                        <media.FaImage className="m-1.5" />
                      </div>
                    </div>
                  ) : item.type.includes("video") ? (
                    <div className="w-full h-full relative">
                      <video className="object-cover object-center w-full h-full">
                        <source src={`${item.url}#t=0.5`} />
                      </video>
                      <small className="bg-black/80 text-white absolute bottom-1 w-full whitespace-nowrap rounded-full py-1 px-2 overflow-x-auto noscrollbar">
                        {item.name}
                      </small>
                      <div className="bg-black/80 text-white absolute top-0 left-0 rounded-r-full flex items-center justify-center">
                        <media.FaVideo className="m-1.5" />
                      </div>
                    </div>
                  ) : item.type.includes("audio") ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-pink-500">
                      <div className="rounded-full bg-border/20 backdrop-blur-md relative">
                        <media.MdAudiotrack className="text-3xl text-white m-4" />
                      </div>
                      <small className="bg-black/80 text-white absolute bottom-1 w-full whitespace-nowrap rounded-full py-1 px-2 overflow-x-auto noscrollbar">
                        {item.name}
                      </small>
                      <div className="bg-black/80 text-white absolute top-0 left-0 rounded-r-full flex items-center justify-center">
                        <media.MdAudiotrack className="m-1.5" />
                      </div>
                    </div>
                  ) : item.type.includes("word") ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-blue-500">
                      <strong className="text-xl font-extrabold text-white uppercase">
                        Word
                      </strong>
                      <small className="bg-black/80 text-white absolute bottom-1 w-full whitespace-nowrap rounded-full py-1 px-2 overflow-x-auto noscrollbar">
                        {item.name}
                      </small>
                      <div className="bg-black/80 text-white absolute top-0 left-0 rounded-r-full flex items-center justify-center">
                        <media.IoDocumentText className="m-1.5" />
                      </div>
                    </div>
                  ) : item.type.includes("pdf") ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-red-500">
                      <strong className="text-xl font-extrabold text-white uppercase">
                        pdf
                      </strong>
                      <small className="bg-black/80 text-white absolute bottom-1 w-full whitespace-nowrap rounded-full py-1 px-2 overflow-x-auto noscrollbar">
                        {item.name}
                      </small>
                      <div className="bg-black/80 text-white absolute top-0 left-0 rounded-r-full flex items-center justify-center">
                        <media.IoDocumentText className="m-1.5" />
                      </div>
                    </div>
                  ) : item.type.includes("excel") ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-green-500">
                      <strong className="text-xl font-extrabold text-white uppercase">
                        Excel
                      </strong>
                      <small className="bg-black/80 text-white absolute bottom-1 w-full whitespace-nowrap rounded-full py-1 px-2 overflow-x-auto noscrollbar">
                        {item.name}
                      </small>
                      <div className="bg-black/80 text-white absolute top-0 left-0 rounded-r-full flex items-center justify-center">
                        <media.IoDocumentText className="m-1.5" />
                      </div>
                    </div>
                  ) : item.type.includes("zip") ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-gray-500">
                      <strong className="text-xl font-extrabold text-black uppercase">
                        Zip
                      </strong>
                      <small className="bg-black/80 text-white absolute bottom-1 w-full whitespace-nowrap rounded-full py-1 px-2 overflow-x-auto noscrollbar">
                        {item.name}
                      </small>
                      <div className="bg-black/80 text-white absolute top-0 left-0 rounded-r-full flex items-center justify-center">
                        <media.IoDocumentText className="m-1.5" />
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
          </div>
          {/* 2nd row`` */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center w-full px-4 rounded-full backdrop-blur-sm overflow-hidden border border-border/20">
              <div
                className={`cursor-pointer mr-2 rounded-full hover:bg-border/20 hover:p-1 ${listAttachment ? "p-1 bg-border/20" : ""} transition-all`}
                onClick={() => setListAttachment((prev) => !prev)}
              >
                <media.IoMdAdd className="text-2xl" />
              </div>
              <media.MdOutlineEmojiEmotions
                className="text-2xl cursor-pointer"
                onClick={() => setShowPicker((prev) => !prev)}
              />
              <textarea
                type="text"
                name="message"
                id={`message/${inputId}`}
                value={msg}
                placeholder="Send a message"
                rows={1}
                className="py-2 px-4 focus:outline-none w-full grow"
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key == "Enter" && !e.shiftKey && !sendLoader) {
                    sendMessage(selectedUser._id);
                  }
                }}
              />
            </div>
            <button
              disabled={sendLoader}
              className="cursor-pointer rounded-full aspect-square p-2 bg-linear-to-tr from-primary to-secondary"
              onClick={() => sendMessage(selectedUser._id)}
            >
              {sendLoader ? (
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
