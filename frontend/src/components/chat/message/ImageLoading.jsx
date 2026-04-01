import { useEffect, useRef, useState } from "react";
import { media } from "../../../assets/data/media";
import axios from "axios";
import { cleanupOldMedia, getFromDB, saveToDB } from "../../../utils/indexedDB";
export default function ImageLoading({ msg }) {
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(false);
  const checkDB = async (url) => {
    const cached = await getFromDB(url);
    if (cached) {
      const imageUrl = URL.createObjectURL(cached.blob);
      setImage(imageUrl);
      setPreview(false);
      setProgress(100);
      return;
    } else {
      setImage(msg.thumbnail);
    }
  };
  useEffect(() => {
    if (msg.image) {
      checkDB(msg.image);
    }
  }, []);
  const handleImage = async (url) => {
    setPreview(false);
    try {
      if (msg.image) {
        checkDB(msg.image);
      }
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
    <div className="relative flex items-center justify-center p-0.5">
      {image && (
        <img
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => setPreview(true)}
          src={image}
          className={`object-center rounded-md object-cover w-100 ${progress == 100 ? "blur-none" : "blur-sm"}`}
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
              className={`text-2xl text-black ${progress > 0 && "animate-ping"}`}
            />
          </div>
        </div>
      )}
      {preview && progress == 100 && (
        <ImagePreview image={image} setPreview={setPreview} />
      )}
    </div>
  );
}

export const ImagePreview = ({ image, setPreview }) => {
  const containerRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const lastPos = useRef({ x: 0, y: 0 });

  // 🖱️ Zoom
  useEffect(() => {
    const el = containerRef.current;

    const handleWheel = (e) => {
      e.preventDefault();

      setScale((prev) => {
        let next = prev + (e.deltaY < 0 ? 0.2 : -0.2);
        return Math.min(Math.max(1, next), 5);
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // 🖱️ Start drag
  const handleMouseDown = (e) => {
    if (scale === 1) return; // only drag when zoomed
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);
  // 🖱️ Move
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  // 🖱️ Stop drag
  const handleMouseUp = () => setDragging(false);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      ref={containerRef}
      className="fixed top-0 left-0 z-50 w-full h-full overflow-hidden backdrop-blur-3xl flex items-center justify-center p-8"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: scale > 1 ? "grab" : "default" }}
    >
      <img
        src={image}
        alt="preview"
        draggable={false}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: dragging ? "none" : "transform 0.1s ease-out",
        }}
        className="max-w-full max-h-full object-contain"
      />
      <media.ImCross
        className="absolute top-4 right-4 text-red-600 text-xl cursor-pointer"
        onClick={() => setPreview(false)}
      />
    </div>
  );
};
