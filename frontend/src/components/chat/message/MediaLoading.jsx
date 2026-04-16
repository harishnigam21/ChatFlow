import { useEffect, useState } from "react";
import axios from "axios";
import { cleanupOldMedia, getFromDB, saveToDB } from "../../../utils/indexedDB";
import MediaDownload from "./MediaDownload";
import MediaPreview from "./MediaPreview";

export const checkDB = async (item, setProgress) => {
  const cached = await getFromDB(item.url);
  if (cached) {
    const previewUrl = URL.createObjectURL(cached.blob);
    setProgress(100);
    return {
      ...item,
      blob: cached.blob,
      previewUrl: previewUrl,
      thumbnail: item.thumbnail,
      type: cached.blob.type,
      size: cached.blob.size,
      status: true,
    };
  } else {
    return {
      ...item,
      status: false,
    };
  }
};
export const handleMedia = async (e, file, setMediaList, setProgress) => {
  if (e) {
    e.stopPropagation();
  }
  try {
    if (file.status) return;
    const res = await axios.get(file.url, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percent);
        } else {
          setProgress((prev) => prev + 5);
        }
      },
    });
    const previewUrl = URL.createObjectURL(res.data);
    await cleanupOldMedia("media");
    await saveToDB(file.url, res.data);
    setMediaList((prev) =>
      prev.map((item) => {
        if (item.thumbnail == file.thumbnail) {
          return {
            ...item,
            blob: res.data,
            previewUrl: previewUrl,
            type: res.data.type,
            size: res.data.size,
            thumbnail: item.thumbnail,
            name: item.name,
            status: true,
          };
        } else {
          return item;
        }
      }),
    );
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
export default function MediaLoading({ msg }) {
  const [mediaList, setMediaList] = useState([]);
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    return () => {
      mediaList.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [mediaList]);

  return (
    <div
      className={`relative w-full grid ${msg.media.length > 1 ? "grid-cols-[minmax(10px,150px)_minmax(10px,150px)] grid-rows-2 aspect-square overflow-hidden" : "grid-cols-1"} gap-1 p-0.5 overflow-hidden`}
    >
      {msg.media &&
        msg.media.length > 0 &&
        msg.media.map((item, index) => (
          <div
            key={`${msg._id}/media/${index}`}
            className={index > 3 ? "hidden" : "contents"}
          >
            <MediaDownload
              item={item}
              index={index}
              mediaList={mediaList}
              setMediaList={setMediaList}
              setPreview={setPreview}
              setSelected={setSelected}
              switchChange={true}
              preview={preview}
            />
          </div>
        ))}

      {preview && (
        <MediaPreview
          mediaList={mediaList}
          setMediaList={setMediaList}
          onClick={() => setPreview(false)}
          selectedMedia={selected}
        />
      )}
    </div>
  );
}
