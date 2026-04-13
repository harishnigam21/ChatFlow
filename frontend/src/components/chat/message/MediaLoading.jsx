import { useEffect, useState } from "react";
import { media } from "../../../assets/data/media";
import axios from "axios";
import { cleanupOldMedia, getFromDB, saveToDB } from "../../../utils/indexedDB";
import { convertFromBytes } from "../../../utils/byteConversion";
import { MediaPreview } from "./MediaPreview";
export default function MediaLoading({ msg }) {
  const [progress, setProgress] = useState(0);
  const [mediaList, setMediaList] = useState([]);
  const [preview, setPreview] = useState(false);
  const [downloadSize, setDownloadSize] = useState(0);
  const checkDB = async (item) => {
    const cached = await getFromDB(item.url);
    if (cached) {
      setMediaList((prev) => [
        ...prev,
        {
          blob: cached.blob,
          thumbnail: item.thumbnail,
          type: cached.blob.type,
          size: cached.blob.size,
          status: true,
        },
      ]);
      setPreview(false);
      setProgress(100);
      return;
    } else {
      setMediaList((prev) => [
        ...prev,
        {
          url: item.thumbnail,
          thumbnail: item.url,
          type: item.resource_type,
          size: item.size,
          status: false,
        },
      ]);
      setDownloadSize((prev) => prev + item.size);
    }
  };

  useEffect(() => {
    if (msg.media) {
      msg.media.map((item) => checkDB(item));
    }
  }, []);

  const handleMedia = async () => {
    setPreview(false);
    try {
      const fetchPromises = mediaList.map(async (file) => {
        if (file.status) return;
        const res = await axios.get(file.thumbnail, {
          responseType: "blob",
        });
        setDownloadSize((prev) => prev - file.size);
        await cleanupOldMedia("media");
        await saveToDB(file.thumbnail, res.data);
        setMediaList((prev) =>
          prev.map((item) => {
            if (item.thumbnail == file.thumbnail) {
              return {
                ...item,
                blob: res.data,
                type: res.type,
                thumbnail: item.url,
                status: true,
              };
            } else {
              return item;
            }
          }),
        );
      });
      await Promise.all(fetchPromises);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div
      className={`relative grid ${mediaList.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-1 p-0.5`}
      onClick={() => setPreview(true)}
    >
      {mediaList &&
        mediaList.length > 0 &&
        mediaList.slice(0, 3).map((item, index) => {
          if (item.type.includes("image")) {
            return (
              <img
                key={`${msg._id}/media/${index}`}
                onContextMenu={(e) => e.preventDefault()}
                src={URL.createObjectURL(item.blob)}
                className={`object-center rounded-md object-cover w-100 h-full cursor-pointer`}
                alt="user uploaded image"
              />
            );
          }
          if (item.type.includes("application")) {
            return (
              <div
                key={`${msg._id}/media/${index}`}
                className="w-full relative overflow-hidden cursor-pointer"
              >
                <div className="w-full aspect-square overflow-hidden blur-sm bg-white">
                  <small>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Incidunt dicta maiores natus eaque, ut eos atque id sunt
                    provident dolorum quod dolore aliquam doloremque consequatur
                    necessitatibus aut consequuntur aperiam accusamus?
                  </small>
                </div>
                <div className="absolute top-0 left-0">
                  {item.type.includes("pdf") ? (
                    <media.BsFillFilePdfFill className="text-2xl text-red-500" />
                  ) : item.type.includes("word") ? (
                    <media.RiFileWord2Fill className="text-2xl text-blue-500" />
                  ) : item.type.includes("excel") ? (
                    <media.RiFileExcel2Fill className="text-2xl text-green-500" />
                  ) : item.type.includes("zip") ? (
                    <media.FaFileZipper className="text-2xl text-gray-500" />
                  ) : (
                    <media.IoDocumentText className="text-2xl text-gray-500" />
                  )}
                </div>
              </div>
            );
          }
        })}
      {mediaList.length > 3 && (
        <div className="flex items-center justify-center">
          <strong className="text-xl">{mediaList.length - 3} +</strong>
        </div>
      )}
      {downloadSize > 0 && (
        <div
          style={{
            backgroundImage: `conic-gradient(blue 0% ${progress}%, white ${progress}% 100%)`,
          }}
          className="absolute self-center justify-self-center rounded-full p-1 transition-all"
        >
          <div
            className="bg-white rounded-full p-1 cursor-pointer flex items-center justify-center flex-col"
            onClick={handleMedia}
          >
            <media.MdDownload
              className={`text-2xl text-black ${progress > 0 && "animate-ping"}`}
            />
            <small>{convertFromBytes(downloadSize)}</small>
          </div>
        </div>
      )}
      {preview && downloadSize <= 0 && (
        <MediaPreview mediaList={mediaList} onClick={() => setPreview(false)} />
      )}
    </div>
  );
}
