import { useDispatch, useSelector } from "react-redux";
import useApi from "../../../hooks/Api";
import { addRequest, removeFollowing } from "../../../redux/slices/UserSlice";
import toast from "react-hot-toast";

export default function ContactItem({ usr, status }) {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user.userInfo);
  const { sendRequest: followRequest, loading: followLoading } = useApi();
  const { sendRequest: unfollowRequest, loading: unfollowLoading } = useApi();
  const handleFollow = async (id) => {
    await followRequest(
      `api/interact/follow/${id}`,
      "POST",
      {},
      {},
      false,
    ).then((result) => {
      const data = result?.data;
      if (result && result.success) {
        toast.success(data.message);
        dispatch(addRequest({ data: data.data }));
        delete status[data.data];
      } else {
        const errMessage = data?.message || "Failed to send Request";
        toast.error(errMessage);
      }
    });
  };
  const handleUnFollow = async (id) => {
    await unfollowRequest(
      `api/interact/unfollow/${id}`,
      "PATCH",
      {},
      {},
      false,
    ).then((result) => {
      const data = result?.data;
      if (result && result.success) {
        toast.success(data.message);
        dispatch(removeFollowing(data.data));
      } else {
        const errMessage = data?.message || "Failed to unFollow";
        toast.error(errMessage);
      }
    });
  };
  return (
    <article className="flex flex-col gap-2">
      <div className="flex items-center px-4 gap-4">
        <div className="aspect-square rounded-full w-12 h-12 flex items-center justify-center bg-bgprimary border border-border/20 text-text uppercase">
          <strong>{usr.name.slice(0, 2)}</strong>
        </div>
        <strong>{usr.name}</strong>
        <div className="flex items-center justify-end-safe grow">
          {user.following.includes(usr._id) ? (
            <div className="flex items-center">
              <button
                className="px-2 rounded-full bg-orange-500 lowercase text-white font-bold flex items-center"
                onClick={() => handleUnFollow(usr._id)}
              >
                UnFollow {unfollowLoading && <span className="spinner"></span>}
              </button>
            </div>
          ) : user.followers.includes(usr._id) ? (
            <button className="px-2 rounded-full bg-red-500 font-medium flex items-center lowercase">
              Remove
            </button>
          ) : (
            <div className="flex items-center">
              {status[usr._id] && status[usr._id] == "pending" ? (
                <button
                  disabled={true}
                  className="px-2 rounded-full bg-blue-500 font-medium lowercase"
                >
                  pending..
                </button>
              ) : (
                <button
                  className="px-2 rounded-full bg-green-500 font-medium text-black flex items-center lowercase"
                  onClick={() => handleFollow(usr._id)}
                >
                  Follow {followLoading && <span className="spinner"></span>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <hr className="w-full border border-border/5" />
    </article>
  );
}
