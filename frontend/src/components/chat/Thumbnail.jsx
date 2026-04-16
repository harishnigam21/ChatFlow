import { media } from "../../assets/data/media";

export function VideoThumbnail({ item, onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className={`w-full relative overflow-hidden cursor-pointer flex items-center justify-center rounded-md bg-white p-2 ${selected == item._id ? "border-4 border-green-500" : ""} `}
    >
      <media.FaVideo className="text-2xl w-full h-full text-blue-500" />
    </div>
  );
}
export function ImageThumbnail({ item, onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className={`w-full rounded-md aspect-square cursor-pointer flex items-center justify-center ${selected == item._id ? "border-4 border-green-500" : ""}`}
    >
      <img
        onContextMenu={(e) => e.preventDefault()}
        src={item.status ? item.previewUrl : item.thumbnail}
        className={`aspect-square object-center rounded-md object-cover w-100`}
        alt="user uploaded image"
      />
    </div>
  );
}
export function AudioThumbnail({ item, onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className={`w-full relative overflow-hidden cursor-pointer flex items-center justify-center rounded-md bg-white p-2 ${selected == item._id ? "border-4 border-green-500" : ""}`}
    >
      <media.MdAudiotrack className="text-2xl w-full h-full text-pink-500" />
    </div>
  );
}
export function ApplicationThumbnail({ item, onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className={`w-full aspect-square cursor-pointer flex items-center justify-center bg-white rounded-md p-2 ${selected == item._id ? "border-4 border-green-500" : ""}`}
    >
      {item.type.includes("pdf") ? (
        <media.BsFillFilePdfFill className="text-2xl w-full h-full text-red-500" />
      ) : item.type.includes("word") ? (
        <media.RiFileWord2Fill className="text-2xl w-full h-full text-blue-500" />
      ) : item.type.includes("excel") ? (
        <media.RiFileExcel2Fill className="text-2xl w-full h-full text-green-500" />
      ) : item.type.includes("zip") ? (
        <media.FaFileZipper className="text-2xl w-full h-full text-gray-500" />
      ) : (
        <media.IoDocumentText className="text-2xl w-full h-full text-gray-500" />
      )}
    </div>
  );
}
