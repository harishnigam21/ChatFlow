import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import { Outlet } from "react-router-dom";
import { media } from "./assets/data/media";
import { Toaster } from "react-hot-toast";
export default function App() {
  return (
    <main
      style={{ backgroundImage: `url(${media.MBG})` }}
      className="flex flex-col w-full min-h-full bg-center bg-cover bg-fixed"
    >
      <Toaster />
      <Header />
      <section className="flex flex-col justify-center items-center grow">
        <Outlet />
      </section>
      {/* <Footer /> */}
    </main>
  );
}
