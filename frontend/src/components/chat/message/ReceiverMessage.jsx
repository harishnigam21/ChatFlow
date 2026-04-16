import { useDispatch } from "react-redux";
import { media } from "../../../assets/data/media";
import { separateTime } from "../../../utils/getDate";
import MediaLoading from "./MediaLoading";
import {
  popMessageToDelete,
  pushMessageToDelete,
} from "../../../redux/slices/SelectedUserSlice";
import { useState } from "react";

export default function ReceiverMessage({ msg }) {
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const handleCheck = async (e, id) => {
    const result = e.target.checked;
    if (result) {
      dispatch(pushMessageToDelete(id));
    } else {
      dispatch(popMessageToDelete(id));
    }
    setChecked(result);
  };
  return (
    <section
      className={`flex justify-end-safe gap-2 ${checked && "bg-gray-600/30"} p-1 rounded-md transition-all`}
    >
      <article className="rounded-[10px_0px_10px_10px] flex flex-col bg-cyan-950/95 p-1 text-white min-w-30 max-w-[50%] wrap-anywhere me self-end overflow-hidden">
        {msg.media && <MediaLoading msg={msg} />}
        <label htmlFor={`msg/${msg._id}`} className="">
          <div className="wrap-anywhere pl-2">
            {msg.deletedForEveryone && !msg.message ? (
              <div className="flex items-center gap-2">
                <media.CiTimer className="self-start mt-0.5" />{" "}
                <span className="text-gray-800/80 font-light text-sm">
                  Message was deleted.
                </span>
              </div>
            ) : (
              msg?.message
                .split("\n")
                .map((pr, index) => (
                  <p key={`${msg._id}/line_break/${index}`}>{pr}</p>
                ))
            )}
          </div>
          <small className="float-end text-[10px]">
            {separateTime(msg.createdAt)}{" "}
          </small>
        </label>
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
