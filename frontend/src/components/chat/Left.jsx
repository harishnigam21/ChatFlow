import { memo, useEffect } from "react";
import { media } from "../../assets/data/media.js";
import useApi from "../../hooks/Api.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setRelativeUser } from "../../redux/slices/UserSlice.js";
import toast from "react-hot-toast";
import BouncingLoading from "../common/BouncingLoading.jsx";
import { formatChatMessageDate } from "../../utils/getDate.js";
const Left = memo(function Left({ selectedUser, getRelativeMessage, bar }) {
  const onlineUsers = useSelector((store) => store.user.onlineUsers);
  const relativeUsers = useSelector((store) => store.user.relativeUsers);
  const user = useSelector((store) => store.user.userInfo);
  const dispatch = useDispatch();
  const { sendRequest, loading } = useApi();
  useEffect(() => {
    sendRequest("api/message/relative").then((result) => {
      if (result && result.success) {
        dispatch(setRelativeUser({ data: result.data.data }));
      } else {
        toast.error(result.data.message || "Failed to Fetch");
      }
    });
  }, []);

  return !loading ? (
    <section
      className={`relative h-full overflow-hidden flex flex-col text-text backdrop-blur-[3px] ${!bar ? "opacity-0 w-0" : "opacity-100 w-full"} transition-all`}
    >
      {/* header */}
      <div className="flex sticky top-0 items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <img src={media.LGL} alt="logo" className="w-10 h-10" />
          <p className="text-base font-medium mt-1">ChatFlow</p>
        </div>
        <div className="flex items-center cursor-pointer">
          <media.HiDotsVertical className="text-2xl" />
        </div>
      </div>
      {/* filter */}
      <div></div>
      <hr className="w-full border border-border/20" />
      {/* participation list */}
      <article className="flex flex-col flex-1 gap-2 p-4 overflow-y-auto">
        {relativeUsers.user &&
          relativeUsers.user.length > 0 &&
          relativeUsers.user.map((usr, index) => (
            <div
              key={`chat/list/user/${index}`}
              className={`flex gap-4 p-2 ${selectedUser?._id == usr._id && "bg-primary/50 rounded-md"} cursor-pointer`}
              onClick={() => getRelativeMessage(usr)}
            >
              {usr.pic ? (
                <img
                  src={usr.pic}
                  alt="user pic"
                  className="aspect-square rounded-full w-12 h-12 object-cover object-center"
                />
              ) : (
                <div className="aspect-square rounded-full w-12 h-12 flex items-center justify-center bg-bgprimary text-text uppercase">
                  <strong>{usr.name.slice(0, 2)}</strong>
                </div>
              )}

              {relativeUsers?.lastMessages?.[usr._id] ? (
                <div className="flex w-full flex-col">
                  <div className="flex w-full justify-between items-center flex-wrap">
                    <strong>{usr.name}</strong>
                    <small className="text-txlight/70">
                      {formatChatMessageDate(
                        relativeUsers.lastMessages[usr._id].createdAt,
                      )}
                    </small>
                  </div>
                  <div className="flex flex-nowrap gap-1 items-center text-txlight/70">
                    {relativeUsers.lastMessages[usr._id].sender_id ==
                      user._id && (
                      <div>
                        {relativeUsers.lastMessages[usr._id].seen ? (
                          <media.BiCheckDouble className="text-blue-500 text-xl" />
                        ) : onlineUsers.includes(
                            relativeUsers.lastMessages[usr._id].receiver_id,
                          ) ? (
                          <media.BiCheckDouble className="text-xl" />
                        ) : (
                          <media.BiCheck className="text-xl" />
                        )}
                      </div>
                    )}
                    {relativeUsers.lastMessages[usr._id].image && (
                      <media.FaImage className="text-xl" />
                    )}
                    <small className="wrap-anywhere basis-full line-clamp-1">
                      {relativeUsers.lastMessages[usr._id].message}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center flex-wrap">
                    <strong>{usr.name}</strong>
                  </div>
                  <small className="text-txlight/70">
                    Start Chatting Now...
                  </small>
                </div>
              )}
              {relativeUsers?.unseen?.[usr._id] > 0 && (
                <div className="flex items-center justify-end grow">
                  <p className="w-10 flex justify-center aspect-square p-2 rounded-full bg-primary/50">
                    {relativeUsers.unseen[usr._id]}
                  </p>
                </div>
              )}
            </div>
          ))}
      </article>
    </section>
  ) : (
    <div className="flex w-full h-full items-center justify-center">
      <BouncingLoading />
    </div>
  );
});
export default Left;
