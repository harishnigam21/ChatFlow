import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { list } from "../../assets/data/navlist";
export default function Header() {
  const [openNav, setOpenNav] = useState(false);
  const NavRef = useRef(null);
  useEffect(() => {
    if (NavRef.current) {
      openNav
        ? NavRef.current.classList.add("myNav")
        : NavRef.current.classList.remove("myNav");
    }
  }, [openNav]);
  return (
    <header className="sticky py-2 px-8 w-full flex gap-8 items-center z-50 border-b border-border/10 backdrop-blur-sm animate-[top_0.5s_ease]">
      {/* three lines */}
      <div className="flex md:hidden items-center justify-between w-full">
        <div
          ref={NavRef}
          className="relative flex flex-col justify-center w-8 h-8 gap-2 cursor-pointer animate-[visibleIn_1s_ease]"
          onClick={() => setOpenNav(!openNav)}
        >
          <p
            id="first"
            className="w-8 border-b-4 border-primary rounded-r-md transition-all duration-500"
          ></p>
          <p
            id="second"
            className="w-6 border-b-4 border-tertiary rounded-r-md transition-all duration-500"
          ></p>
          <p
            id="third"
            className="w-8 border-b-4 border-secondary rounded-r-md transition-all duration-500"
          ></p>
        </div>
        <Link to={list[0].path}>
          <img
            className="min-w-14 h-14 object-center object-cover"
            src={list[0].src}
            alt={list[0].name}
          />
        </Link>
        {openNav && (
          <article className="fixed top-18 left-0 bg-bgprimary flex flex-col items-center p-4 gap-8 rounded-b-xl animate-[fromTop_1s_ease] border-b border-r w-60 h-full">
            {list.slice(1).map((item, index) => (
              <Link
                className="font-bold text-tertiary uppercase"
                to={item.path}
                key={`min/navlist/${index}`}
              >
                {item.name}
              </Link>
            ))}
          </article>
        )}
      </div>
      <div className="hidden md:flex">
        <Link to={list[0].path} className="pr-8">
          <img
            className="min-w-14 h-14 object-center object-cover"
            src={list[0].src}
            alt={list[0].name}
          />
        </Link>
        <article className="flex gap-8 items-center grow animate-[fromLeft_1s_ease]">
          {list.slice(1).map((item, index) => (
            <Link
              className="font-bold text-tertiary uppercase"
              to={item.path}
              key={`max/navlist/${index}`}
            >
              {item.name}
            </Link>
          ))}
        </article>
      </div>
    </header>
  );
}
