import { useEffect, useState } from "react";
import { media } from "../../../assets/data/media";
import axios from "axios";
import { cleanupOldMedia, getFromDB, saveToDB } from "../../../utils/indexedDB";
export default function ImageLoading({ msg }) {
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState(null);
  useEffect(() => {
    const checkDB = async (url) => {
      const cached = await getFromDB(url);
      if (cached) {
        const imageUrl = URL.createObjectURL(cached.blob);
        setImage(imageUrl);
        setProgress(100);
        return;
      } else {
        setImage(msg.thumbnail);
      }
    };
    if (msg.image) {
      checkDB(msg.image);
    }
  }, []);
  const handleImage = async (url) => {
    try {
      const res = await axios.get(url, {
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
      await cleanupOldMedia("media");
      await saveToDB(url, res.data);
      const imageUrl = URL.createObjectURL(res.data);
      setImage(imageUrl);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="relative flex items-center justify-center">
      {image && (
        <img
          src={image}
          className={`object-center object-cover w-100 rounded-tl-md ${progress == 100 ? "blur-none" : "blur-sm"}`}
          alt="user uploaded image"
        />
      )}
      {progress != 100 && (
        <div
          style={{
            backgroundImage: `conic-gradient(blue 0% ${progress}%, white ${progress}% 100%)`,
          }}
          className="absolute rounded-full p-1 transition-all"
        >
          <div
            className="bg-white rounded-full p-1 cursor-pointer"
            onClick={() => handleImage(msg.image)}
          >
            <media.MdDownload
              className={`text-2xl ${progress > 0 && "animate-ping"}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
