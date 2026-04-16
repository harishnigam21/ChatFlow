import React, { useEffect, useMemo, useState } from "react";
import MediaDownload from "./MediaDownload";
import { media } from "../../../assets/data/media";
import toast from "react-hot-toast";
import Image from "../preview/Image";
import Audio from "../preview/Audio";
import Video from "../preview/Video";

export default function MediaPreview({
  mediaList,
  setMediaList,
  onClick,
  selectedMedia,
}) {
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState(selectedMedia);
  const [selectedFile, setSelectedFile] = useState(null);
  const [type, setType] = useState(null);
  function getFileType(file) {
    const type = file.type || "";
    if (type.includes("image")) return "image";
    if (type.includes("video")) return "video";
    if (type.includes("audio")) return "audio";
    return "unknown";
  }
  useEffect(() => {
    setType(null);
    setSelectedFile(null);
    const file = mediaList.find((item) => item._id == selected);
    const fileType = getFileType(file);
    setType(fileType);
    setSelectedFile(file);
  }, [selected,mediaList]);
  const fileUrl = useMemo(() => {
    if (!selectedFile?.blob) return null;
    return URL.createObjectURL(selectedFile.blob);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);
  async function downloadSingle(file) {
    if (!file) {
      toast.error("No Media Selected");
      return;
    }
    if (!file.blob) {
      toast.error("No Media Selected");
      return;
    }
    const blob = file.blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = file.name || file.thumbnail.split("/").slice(-1)[0];
    a.download = name || "file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return (
    <section className="fixed top-0 right-0 bg-bgprimary/80 backdrop-blur-md w-screen h-screen z-50 flex flex-col">
      <article className="flex items-center w-full justify-between gap-4 p-2">
        <small className="text-white line-clamp-1">
          {selectedFile?.name || "waiting..."}
        </small>
        <div className="flex gap-4 items-center">
          <media.MdDownload
            className="text-3xl text-blue-500 cursor-pointer"
            onClick={() => downloadSingle(selectedFile)}
          />
          <media.FaShareSquare className="text-3xl text-green-500 cursor-pointer" />
          <media.ImCross
            onClick={onClick}
            className="text-red-500 text-xl cursor-pointer"
          />
        </div>
      </article>
      <article className="flex grow w-full items-center-safe justify-center-safe">
        {setPreview && (
          <article className="overflow-auto rounded relative max-w-[90%] grow h-full max-h-[80vh] flex flex-col items-center-safe justify-center-safe">
            {type === "image" && <Image image={fileUrl} />}
            {type === "audio" && (
              <Audio url={fileUrl} name={selectedFile?.name} />
            )}
            {type === "video" && (
              <Video url={fileUrl} name={selectedFile?.name} />
            )}
            {type === "unknown" && (
              <div className="text-red-500 text-center flex flex-col gap-4 items-center justify-center max-w-fit backdrop-blur-2xl p-5 rounded-xl self-center bg-tertiary">
                <strong>Preview not Available, You can download it</strong>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <button
                    className="flex items-center py-2 px-4 gap-2 rounded-xl text-white bg-blue-600 hover:scale-105 transition-all font-bold whitespace-nowrap"
                    onClick={() => {
                      if (selectedFile?.blob) {
                        window.open(
                          `https://docs.google.com/gview?url=${selectedFile.url}&embedded=true`,
                          "_blank",
                        );
                      }
                    }}
                  >
                    Open
                    <media.FaArrowLeft className="text-2xl text-green-600 rotate-135" />
                  </button>
                  <button
                    className="flex items-center py-2 px-4 gap-2 rounded-xl text-white bg-green-600 hover:scale-105 transition-all font-bold whitespace-nowrap"
                    onClick={() => downloadSingle(selectedFile)}
                  >
                    Download
                    <media.FaDownload className="text-2xl text-blue-600" />
                  </button>
                </div>
              </div>
            )}
          </article>
        )}
      </article>
      <article className="relative w-full bg-gray-500/10 flex flex-nowrap gap-4 p-2 overflow-auto">
        {mediaList &&
          mediaList.length > 0 &&
          mediaList.map((item, index) => (
            <div
              className="min-w-15 max-w-20 aspect-square"
              key={`${item._id}/media/preview/thumbnail/${index}`}
            >
              <MediaDownload
                item={item}
                index={index}
                mediaList={mediaList}
                setMediaList={setMediaList}
                setPreview={setPreview}
                setSelected={setSelected}
                switchChange={false}
                selected={selected}
              />
            </div>
          ))}
      </article>
    </section>
  );
}
