import { memo, useEffect, useRef, useState } from "react";
import { media } from "../../assets/data/media.js";
import { useElementHeight } from "../../hooks/useElementHeight.jsx";
import { useNavigate } from "react-router-dom";
import Participants from "./Participants.jsx";
import Contacts from "./Contacts.jsx";
import { useDispatch, useSelector } from "react-redux";
import Requests from "./Requests.jsx";
import {
  setOtherUser,
  setRelativeUser,
  setRequest,
} from "../../redux/slices/UserSlice.js";
import useApi from "../../hooks/Api.jsx";
import BouncingLoading from "../common/BouncingLoading.jsx";
import toast from "react-hot-toast";

const Left = memo(function Left({
  selectedUser,
  getRelativeMessage,
  bar,
  setToShow,
}) {
  const [headerRef, headerHeight] = useElementHeight();
  const [participationRef, participationHeight] = useElementHeight();
  const { sendRequest: usersRequest } = useApi();
  const { sendRequest: relativeRequest } = useApi();
  const { sendRequest: requestRequest } = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const relativeUsers = useSelector((store) => store.user.relativeUsers);
  const [filteredUser, setFilteredUser] = useState(relativeUsers.user);
  const [search, setSearch] = useState("");
  const [toggle, setToggle] = useState(false);
  const [expand, setExpand] = useState(false);
  const [tab, setTab] = useState("chat");
  const [show, setShow] = useState(false);
  useEffect(() => {
    setFilteredUser(relativeUsers.user);
  }, [relativeUsers]);
  useEffect(() => {
    if (relativeUsers.user)
      setFilteredUser(
        relativeUsers.user.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
  }, [search]);
  useEffect(() => {
    try {
      relativeRequest("api/users/relative").then((result) => {
        if (result && result.success) {
          dispatch(setRelativeUser({ data: result.data.data }));
        } else {
          toast.error(result.data.message || "Failed to Fetch");
        }
      });
      usersRequest("api/users/all").then((result) => {
        if (result && result.success) {
          dispatch(setOtherUser({ data: result.data.data }));
        } else {
          toast.error(result.data.message || "Failed to Fetch");
        }
      });
      requestRequest("api/request/all").then((result) => {
        if (result && result.success) {
          dispatch(setRequest({ data: result.data.data }));
        } else {
          toast.error(result.data.message || "Failed to Fetch");
        }
      });
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setShow(true);
    }
  }, []);
  return show ? (
    <section
      className={`relative h-full overflow-hidden flex flex-col text-text backdrop-blur-[3px] ${!bar ? "opacity-0 w-0" : "opacity-100 w-full"} transition-all`}
    >
      {/* header */}
      <div ref={headerRef} className="flex flex-col">
        <div className=" flex sticky top-0 items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <img
              src={media.LGL}
              alt="logo"
              className="w-10 h-10 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <p className="text-base font-medium mt-1">ChatFlow</p>
          </div>
          <div className=" flex items-center cursor-pointer">
            <media.HiDotsVertical
              className="text-2xl"
              onClick={() => {
                setToggle((prev) => !prev);
                setExpand(false);
              }}
            />
            <div
              style={{
                top: `${headerHeight + 2}px`,
                height: `${participationHeight}px`,
              }}
              className={`absolute  ${toggle ? "flex" : "hidden"} right-0 border-border/20 bg-transparent flex-col items-center justify-start whitespace-nowrap transition-all ease-in duration-300 gap-2`}
            >
              <media.BsChevronCompactLeft
                className={`text-2xl m-2 font-bold text-primary ${expand ? "rotate-180 self-end" : "rotate-0 self-start"}`}
                onClick={() => setExpand((prev) => !prev)}
              />
              {toggle && (
                <div
                  className="px-6 py-3 bg-primary rounded-l-full hover:bg-primary/50 w-full flex gap-2 items-center shrink animate-[expandLeft_0.3s_ease]"
                  onClick={() => {
                    setToggle(false);
                    setToShow("profile");
                  }}
                >
                  <media.CgProfile className="text-2xl" />
                  {expand && <p>My Profile</p>}
                </div>
              )}
              {toggle && (
                <div
                  className="px-6 py-3 bg-primary rounded-l-full hover:bg-primary/50 w-full flex gap-2 items-center shrink animate-[expandLeft_0.8s_ease] "
                  onClick={() => {
                    setToggle(false);
                    setToShow("setting");
                  }}
                >
                  <media.IoIosSettings className="text-2xl" />
                  {expand && <p>Setting</p>}
                </div>
              )}
            </div>
          </div>
        </div>
        <hr className="w-full border border-border/20" />
        {/* filter */}
        <div className="w-full py-2 px-4 rounded-full flex items-center">
          <input
            type="search"
            name="search"
            id="aearch"
            className="outline-none text-base grow"
            placeholder="Search here..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <hr className="w-full border border-border/20" />
        {/* section : different tabs like chat,contact */}
        <article className="flex">
          <div
            className={`grow flex items-center-safe justify-center p-2 border-r border-r-secondary cursor-pointer hover:bg-primary ${tab == "chat" && "bg-primary"} transition-all`}
            onClick={() => setTab("chat")}
          >
            <media.IoChatbubbleSharp className="text-4xl text-tertiary" />
          </div>
          <div
            className={`grow flex items-center-safe justify-center p-2 border-r border-r-secondary cursor-pointer hover:bg-primary ${tab == "contact" && "bg-primary"} transition-all`}
            onClick={() => setTab("contact")}
          >
            <media.RiContactsBook3Fill className="text-4xl text-tertiary" />
          </div>
          <div
            className={`grow flex items-center-safe justify-center p-2 cursor-pointer hover:bg-primary ${tab == "request" && "bg-primary"} transition-all`}
            onClick={() => setTab("request")}
          >
            <media.FaCodePullRequest className="text-2xl text-tertiary" />
          </div>
        </article>
      </div>
      <hr className="w-full border border-border/20" />

      {tab == "chat" ? (
        // participation list
        <Participants
          setTab={setTab}
          participationRef={participationRef}
          filteredUser={filteredUser}
          selectedUser={selectedUser}
          getRelativeMessage={getRelativeMessage}
        />
      ) : tab == "contact" ? (
        <Contacts search={search} />
      ) : tab == "request" ? (
        <Requests />
      ) : (
        <p>TODO</p>
      )}
    </section>
  ) : (
    <div className="flex w-full h-full items-center justify-center">
      <BouncingLoading />
    </div>
  );
});
export default Left;
