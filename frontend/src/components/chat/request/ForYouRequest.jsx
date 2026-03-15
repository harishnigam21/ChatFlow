import { useState } from "react";
import { media } from "../../../assets/data/media";
import { formatChatMessageDate } from "../../../utils/getDate";
import useApi from "../../../hooks/Api";
import toast from "react-hot-toast";
import {
  deleteRequest,
  addFollowers,
} from "../../../redux/slices/UserSlice";
import { useDispatch } from "react-redux";

export default function ForYouRequest({ item, index }) {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const { sendRequest: acceptRequest, loading: acceptLoading } = useApi();
  const { sendRequest: rejectRequest, loading: rejectLoading } = useApi();
  const handleAccept = async (id) => {
    await acceptRequest(
      `api/request/accept/${id}`,
      "PATCH",
      {},
      {},
      false,
    ).then((result) => {
      const data = result?.data;
      if (result && result.success) {
        toast.success(data?.message || "Request accepted");
        dispatch(addFollowers(data.data.sender_id));
        dispatch(deleteRequest(data.data.id));
      } else {
        errMessage = data?.message || "Failed to accept request";
        toast.error(errMessage);
      }
    });
  };
  const handleReject = async (id) => {
    await rejectRequest(
      `api/request/reject/${id}`,
      "PATCH",
      {},
      {},
      false,
    ).then((result) => {
      const data = result?.data;
      if (result && result.success) {
        toast.success(data?.message || "Request rejected");
        dispatch(deleteRequest(data.data.id));
      } else {
        errMessage = data?.message || "Failed to accept request";
        toast.error(errMessage);
      }
    });
  };
  return (
    <article
      style={{ animationDuration: `${(index + 1) * 150}ms` }}
      className={`cursor-pointer animate-[expandRight_0.5s_ease]`}
    >
      {item.type == "connection" && (
        <div className="flex flex-col gap-2 justify-center-safe bg-secondary text-black rounded-xl py-2 px-4">
          <div
            className={`flex gap-2 flex-col ${show ? "max-h-80" : "max-h-[2.2ch]"} transition-all ease-in duration-100 overflow-hidden`}
          >
            <div
              className="flex items-center justify-between gap-2"
              onClick={() => setShow((prev) => !prev)}
            >
              <span className="flex">
                {item.sender_id.name} sends follow request to you.
                <media.FaCaretDown
                  className={`cursor-pointer transition-all ${show ? "rotate-180" : "rotate-0"} self-start`}
                />
              </span>
              <span className="self-start">
                {formatChatMessageDate(item.createdAt)}
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                className="px-3 rounded-full bg-green-500 text-black uppercase text-sm py-1 flex items-center gap-2"
                onClick={() => handleAccept(item._id)}
              >
                accept {acceptLoading && <span className="spinner"></span>}
              </button>
              <button
                className="px-3 rounded-full bg-red-500 text-white uppercase text-sm py-1 flex items-center gap-2"
                onClick={() => handleReject(item._id)}
              >
                reject {rejectLoading && <span className="spinner"></span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
