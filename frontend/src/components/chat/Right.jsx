import { media } from "../../assets/data/media";
import useApi from "../../hooks/Api";
import { memo, useEffect, useState } from "react";
import Loading from "../common/Loading";
import MediaDownload from "./message/MediaDownload";
import MediaPreview from "./message/MediaPreview";
const Right = memo(function Right({ selectedUser, setInfo }) {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState(null);
  const { sendRequest } = useApi();
  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      sendRequest(`api/profile/media/${selectedUser._id}`).then((result) => {
        if (result && result.success) {
          const data = result.data.data;
          if (data.length === 0) {
            setLoading(false);
            return;
          }
          setMediaList(data);
        }
        setLoading(false);
      });
    }
  }, [selectedUser]);
  return !loading && selectedUser ? (
    <section
      className={`absolute w-full md:w-1/2 top-0 right-0 z-60 flex flex-col gap-2 items-center h-full overflow-x-hidden overflow-y-auto text-text bg-bgprimary/98`}
      // onMouseLeave={() => setInfo(false)}
    >
      <div
        style={{
          backgroundImage: selectedUser.banner
            ? `url(${selectedUser.banner})`
            : "none",
        }}
        className="w-full flex items-end-safe pt-15 md:pt-25 justify-center-safe bg-cover bg-no-repeat bg-center"
      >
        {selectedUser.pic ? (
          <img
            src={selectedUser.pic}
            alt="user pic"
            className="aspect-square rounded-full w-40 h-40 object-cover object-center"
          />
        ) : (
          <div className="aspect-square rounded-full w-40 h-40 flex items-center justify-center bg-bgprimary text-text uppercase border border-gray-600/10">
            <strong>{selectedUser?.name.slice(0, 2)}</strong>
          </div>
        )}
      </div>
      <h3 className="text-xl">{selectedUser.name}</h3>
      <small>{selectedUser.bio}</small>
      <hr className="w-full border border-border/20 border-dotted" />

      <div className="w-full flex flex-col gap-2 p-4">
        <div className="flex relative items-center">
          <strong>Media</strong>
          <hr className="w-full border border-border/20 mt-1" />
        </div>
        {mediaList && mediaList.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
            {mediaList.map((item, index) => (
              <div key={`profile/media/${index}`}>
                <MediaDownload
                  item={item}
                  index={index}
                  mediaList={mediaList}
                  setMediaList={setMediaList}
                  setPreview={setPreview}
                  preview={preview}
                  setSelected={setSelected}
                  switchChange={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-600">no media !</p>
        )}
      </div>
      <div
        className="absolute flex items-center top-2 left-2 cursor-pointer"
        onClick={() => setInfo(false)}
      >
        <media.FaArrowLeft className="text-base" />
      </div>
      <div className="flex grow items-end p-4">
        <button className="px-18 py-2 rounded-full bg-linear-to-r from-primary to-secondary text-black font-medium">
          Logout
        </button>
      </div>
      {preview && (
        <MediaPreview
          mediaList={mediaList}
          setMediaList={setMediaList}
          onClick={() => setPreview(false)}
          selectedMedia={selected}
        />
      )}
    </section>
  ) : (
    <div className=" flex justify-center items-center">
      <Loading />
    </div>
  );
});
export default Right;
