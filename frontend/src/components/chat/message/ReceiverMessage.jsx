import { media } from "../../../assets/data/media";
import { getDaysBetween, separateTime } from "../../../utils/getDate";
import ImageLoading from "./ImageLoading";

export default function ReceiverMessage({ msg }) {
  return (
    <div className="rounded-[10px_0px_10px_10px] flex flex-col bg-secondary/80 text-black min-w-30 max-w-[50%] wrap-anywhere me self-end overflow-hidden">
      {msg.image && <ImageLoading msg={msg} />}
      <div className="relative flex gap-2 pb-3">
        <div className="wrap-anywhere p-1 pl-2">
          {msg.deletedForEveryone && !msg.message ? (
            <div className="flex items-center gap-2">
              <media.CiTimer className="self-start mt-0.5" />{" "}
              <span className="text-gray-800/80 font-light text-sm">
                Message was deleted.
              </span>
            </div>
          ) : (
            msg.message
          )}
        </div>
        <small className="absolute bottom-0 right-0 text-[10px] grow text-right flex flex-nowrap items-end justify-end gap-1 pr-1 whitespace-nowrap">
          {separateTime(msg.createdAt)}{" "}
        </small>
      </div>
    </div>
  );
}
