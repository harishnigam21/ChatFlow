import { formatChatMessageDate } from "../../utils/getDate.js";
import { useSelector } from "react-redux";
import { media } from "../../assets/data/media.js";

export default function Participants({
  participationRef,
  filteredUser,
  getRelativeMessage,
  selectedUser,
  setTab,
}) {
  const onlineUsers = useSelector((store) => store.user.onlineUsers);
  const user = useSelector((store) => store.user.userInfo);
  const relativeUsers = useSelector((store) => store.user.relativeUsers);
  return (
    <article
      className="flex flex-col flex-1 gap-2 p-4 overflow-y-auto"
      ref={participationRef}
    >
      {filteredUser && filteredUser.length > 0 ? (
        filteredUser.map((usr, index) => (
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
                  {relativeUsers.lastMessages[usr._id].sender_id == user._id &&
                    onlineUsers && (
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
                <small className="text-txlight/70">Start Chatting Now...</small>
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
        ))
      ) : (
        <div className="w-full h-full flex items-center-safe justify-center-safe">
          <div className="flex flex-col justify-center items-center">
            <media.BiSolidMessageAltAdd className="text-8xl" />
            <p className="text-xl">No Contacts</p>
            <small>Try to add some new contacts</small>
            <button
              className="px-3 my-2 rounded-full border border-white"
              onClick={() => setTab("contact")}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
