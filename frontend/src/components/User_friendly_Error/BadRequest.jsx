import { useNavigate } from "react-router-dom";
import { IoIosWarning } from "react-icons/io";
export default function BadRequest() {
  const navigate = useNavigate();
  return (
    <section className="w-full p-4 h-screen flex items-center justify-center bg-bgprimary">
      <article className="max-w-full flex-wrap sm:flex-nowrap flex justify-center gap-6 rounded-xl py-10 px-6 bg-border/5 border border-border">
        <div className="icon flex items-center">
          <IoIosWarning className="text-9xl text-red-600" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl sm:text-4xl text-red-500 uppercase font-extrabold">
              Bad Request
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-text">
              Your Browser sent a request that our server unable to fulfill
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="py-2 px-4 rounded-full uppercase text-text bg-red-500 icon font-medium"
              onClick={() => navigate("/", { replace: true })}
            >
              Try Again
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
