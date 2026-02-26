import { useOutlet, Outlet, useNavigate } from "react-router-dom";
import { media } from "../../assets/data/media";
import { useSelector } from "react-redux";
import { useEffect } from "react";
export default function Signin() {
  const loginStatus = useSelector((store) => store.user.loginStatus);
  const outlet = useOutlet();
  const navigate = useNavigate();
  useEffect(() => {
    let acTk = false;
    const tk = window.localStorage.getItem("acTk");
    if (tk && JSON.parse(tk).length > 5) {
      acTk = true;
    }
    if (loginStatus || acTk) {
      navigate("/chat");
    }
  }, []);
  return (
    <section className="w-full h-screen">
      <article className="flex flex-col items-center justify-center-safe md:flex-row md:justify-evenly md:items-center h-full w-full p-6">
        <img
          onClick={() => navigate("/")}
          src={media.LGM}
          alt="logo"
          className="object-center object-cover w-40 md:w-75 md:h-75 aspect-square cursor-pointer"
        />
        {outlet ? (
          <Outlet />
        ) : (
          <article className="flex flex-col gap-4 bg-bgprimary/25 text-text rounded-xl p-8">
            <h3 className="text-3xl md:text-4xl">
              Hey! Welcome to ChatFlow 👋
            </h3>
            <small>What would you like to have !</small>
            <button
              className="p-2 md:p-4 mx-4 rounded-xl bg-linear-to-r hover:bg-linear-to-l hover:scale-105 from-primary to-secondary text-2xl font-medium text-white cursor-pointer transition-all"
              onClick={() => navigate("/auth/signin")}
            >
              Sign In
            </button>
            <button
              className="p-2 md:p-4 mx-4 rounded-xl bg-linear-to-r hover:bg-linear-to-l hover:scale-105 from-primary to-secondary text-2xl font-medium text-white cursor-pointer transition-all"
              onClick={() => navigate("/auth/signup")}
            >
              Sign Up
            </button>
          </article>
        )}
      </article>
    </section>
  );
}
