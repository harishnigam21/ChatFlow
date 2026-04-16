import React, { useEffect, useState } from "react";
import { media } from "../../../assets/data/media";
import { convertFromBytes } from "../../../utils/byteConversion";
import {
  ApplicationThumbnail,
  AudioThumbnail,
  ImageThumbnail,
  VideoThumbnail,
} from "../Thumbnail";
import { checkDB, handleMedia } from "./MediaLoading";
export default function MediaDownload({
  item: initialItem,
  index,
  mediaList,
  setMediaList,
  setPreview,
  setSelected,
  switchChange,
  selected,
  preview,
}) {
  const item = mediaList.find((i) => i._id === initialItem._id) || initialItem;

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (selected && selected == item._id && progress == 0) {
      handleMedia(null, item, setMediaList, setProgress);
      setSelected(item._id);
    }
  }, []);
  useEffect(() => {
    const init = async () => {
      try {
        const updatedData = await checkDB(initialItem, setProgress);

        setMediaList((prev) => {
          const exists = prev.find((i) => i._id === updatedData._id);
          if (exists) {
            return prev.map((i) =>
              i._id === updatedData._id ? updatedData : i,
            );
          }
          return [...prev, updatedData];
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [initialItem._id]);
  if (loading)
    return (
      <div className="aspect-square w-full bg-gray-400 animate-pulse rounded-md" />
    );
  return (
    <div className="relative">
      {item.type.includes("image") ? (
        <ImageThumbnail
          item={item}
          selected={selected}
          onClick={() => {
            setSelected(item._id);
            setPreview(true);
          }}
        />
      ) : item.type.includes("video") ? (
        <VideoThumbnail
          item={item}
          selected={selected}
          onClick={() => {
            setSelected(item._id);
            setPreview(true);
          }}
        />
      ) : item.type.includes("audio") ? (
        <AudioThumbnail
          item={item}
          selected={selected}
          onClick={() => {
            setSelected(item._id);
            setPreview(true);
          }}
        />
      ) : item.type.includes("application") ? (
        <ApplicationThumbnail
          item={item}
          selected={selected}
          onClick={() => {
            setSelected(item._id);
            setPreview(true);
          }}
        />
      ) : (
        <></>
      )}
      {(switchChange ? index == 3 : false) && switchChange && (
        <div
          className="absolute w-full h-full flex aspect-square bg-bgprimary/90 inset-0 backdrop-blur-sm text-text items-center justify-center cursor-pointer"
          onClick={() => {
            setPreview(true);
            setSelected(item._id);
          }}
        >
          <strong className="text-xl">{mediaList.length - 3} +</strong>
        </div>
      )}
      {(switchChange ? index != 3 : true) && progress !== 100 && !item.status && (
        <div className="absolute w-full h-full flex aspect-square bg-bgprimary/90 text-text inset-0 text-text items-center justify-center">
          <div
            style={{
              backgroundImage: `conic-gradient(blue 0% ${progress}%, white ${progress}% 100%)`,
            }}
            className="absolute aspect-square w-12 overflow-hidden self-center justify-self-center rounded-full p-1 transition-all"
          >
            <div
              className="bg-white rounded-full p-1 cursor-pointer flex items-center justify-center flex-col"
              onClick={(e) => {
                handleMedia(e, item, setMediaList, setProgress);
                setSelected(item._id);
              }}
            >
              <media.MdDownload
                className={`text-2xl text-black ${progress > 0 ? "animate-ping" : ""}`}
              />
              <small className="text-black whitespace-nowrap text-[8px]">
                {convertFromBytes(item.size)}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
