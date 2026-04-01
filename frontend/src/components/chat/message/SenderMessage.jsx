import { useDispatch, useSelector } from "react-redux";
import { media } from "../../../assets/data/media";
import { separateTime } from "../../../utils/getDate";
import ImageLoading from "./ImageLoading";
import { useState } from "react";
import {
  popMessageToDelete,
  pushMessageToDelete,
} from "../../../redux/slices/SelectedUserSlice";
export default function SenderMessage({ msg, selectedUser }) {
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);
  const onlineUsers = useSelector((store) => store.user.onlineUsers);
  const user = useSelector((store) => store.user.userInfo);
  const handleCheck = async (e, id) => {
    const result = e.target.checked;
    if (result) {
      dispatch(pushMessageToDelete(id));
    } else {
      dispatch(popMessageToDelete(id));
    }
    setChecked(result);
  };
  if (msg.deletedFor.includes(user._id)) {
    return;
  }
  return (
    <section
      className={`flex gap-2 ${checked && "bg-gray-600/30"} p-1 rounded-md transition-all`}
    >
      <article className=" rounded-[0px_10px_10px_10px] flex flex-col bg-secondary/80 text-black min-w-30 max-w-[50%] wrap-anywhere you self-start overflow-hidden">
        {msg.deletedForEveryone ? (
          <label
            htmlFor={`msg/${msg._id}`}
            className="flex items-center gap-2 wrap-anywhere p-1 pl-2"
          >
            <media.IoBanOutline className="self-start mt-0.5" />{" "}
            <span className="text-gray-800/80 font-light text-sm">
              You deleted this message...
            </span>
          </label>
        ) : (
          <>
            {msg.image && <ImageLoading msg={msg} />}
            <label
              htmlFor={`msg/${msg._id}`}
              className="relative pb-3 flex gap-2"
            >
              <p htmlFor={`msg/${msg._id}`} className="wrap-anywhere p-1 pl-2">
                {msg.message}
              </p>
              <small className="absolute bottom-0 right-0 text-[10px] grow text-right flex flex-nowrap items-end justify-end gap-1 whitespace-nowrap">
                {separateTime(msg.createdAt)}
                {msg.seen ? (
                  <media.BiCheckDouble className="text-base text-blue-700" />
                ) : onlineUsers?.includes(selectedUser._id) ? (
                  <media.BiCheckDouble className="text-base" />
                ) : (
                  <media.BiCheck className="text-base" />
                )}
              </small>
            </label>
          </>
        )}
      </article>
      <input
        checked={checked}
        onChange={(e) => handleCheck(e, msg._id)}
        type="checkbox"
        name="message"
        className="self-start hidden"
        id={`msg/${msg._id}`}
      />
    </section>
  );
}
