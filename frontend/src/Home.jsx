import { MessageSquare, Users, Shield, ArrowRight } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { media } from "./assets/data/media";

export default function Home() {
  const navigate = useNavigate();
  const { ref: featureScrollRef, inView: featureScrollView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  return (
    <section className="text-text w-full font-sans">
      {/* Hero Section */}
      <article
        id="intro"
        className=" p-8 flex flex-col lg:flex-row items-center gap-8 min-h-[98dvh]"
      >
        <article className="flex flex-col text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-primary">
            Connect & Communicate with{" "}
            <span className="text-secondary">ChatFlow</span>
          </h1>
          <p className=" md:text-lg text-txlight mb-10 max-w-2xl">
            Seamless messaging, real-time collaboration, and secure connections
            for teams and communities. Experience the next generation of chat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              className="bg-secondary hover:bg-secondary text-black px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
              onClick={() => navigate("auth/signin")}
            >
              Start Chatting Now{" "}
              <ArrowRight size={20} className="animate-ping" />
            </button>
            <button className="border-2 border-border/20 hover:border-border/80 px-8 py-4 rounded-xl font-bold transition-all">
              Learn More
            </button>
          </div>
        </article>
        {/* Decorative App Mockup */}
        <article className="backdrop-blur-md rounded-3xl shadow-2xl border border-border/20 relative overflow-hidden">
          <div className="rounded-xl">
            <img
              className="w-full h-full object-center object-cover"
              src={media.app_preview}
              alt="App Preview Image Placeholder"
            />
          </div>
          {/* Floating UI Elements */}
          <div className="absolute top-10 -right-4 bg-white text-black sm:p-4 shadow-xl rounded-2xl border border-blue-50 flex items-center gap-3 animate-bounce">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-bold">New Message</p>
              <p className="text-[10px]">Team is online</p>
            </div>
          </div>
        </article>
      </article>
      {!featureScrollView && (
        <div
          className="sticky bottom-0 px-1.5 rounded-full border bg-bgprimary h-12 flex self-center justify-self-center items-start gap-2 cursor-pointer overflow-hidden"
          onClick={() => {
            const element = document.getElementById("features");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <div className="w-3 h-3 rounded-full bg-text animate-[scrollPointVertical_1.2s_linear_infinite]"></div>
        </div>
      )}

      {/* Features Grid */}
      <article ref={featureScrollRef} id="features" className=" p-8">
        <h2 className="text-3xl font-bold text-center py-8 mb-8 text-primary">
          Why Choose ChatFlow?
        </h2>
        <div className=" grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MessageSquare className="text-blue-500" />}
            title="Real-time Messaging"
            desc="Instant delivery with lightning fast websocket connections."
          />
          <FeatureCard
            icon={<Users className="text-green-500" />}
            title="Team Collaboration"
            desc="Create rooms, share files, and manage projects in one place."
          />
          <FeatureCard
            icon={<Shield className="text-purple-500" />}
            title="Secure & Private"
            desc="End-to-end encryption to keep your conversations your own."
          />
        </div>
      </article>
      <hr className="w-full border border-border/10" />
      <article className=" px-8 py-24 space-y-32 ">
        {/* Feature 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 order-2 lg:order-1">
            <div className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-primary bg-blue-50 rounded-full">
              Real-time Speed
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              Never miss a beat with instant sync
            </h2>
            <p className="md:text-lg leading-relaxed mb-8">
              Our proprietary websocket architecture ensures that messages are
              delivered in under 100ms. Whether you're across the street or
              across the globe, it feels like you're in the same room.
            </p>
            <ul className="space-y-4 text-txlight font-medium">
              <li className="flex items-center gap-3">
                ✅ Low-latency message delivery
              </li>
              <li className="flex items-center gap-3">
                ✅ Global server distribution
              </li>
            </ul>
          </div>
          <div className="flex-1 order-1 lg:order-2 rounded-3xl shadow-inner overflow-hidden">
            <img
              className="w-full h-full object-center object-cover"
              src={media.real_time}
              alt="[High-quality Dashboard Screenshot]"
            />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 rounded-3xl shadow-inner overflow-hidden">
            <img
              className="w-full h-full object-center object-cover"
              src={media.collabaration}
              alt="[File Sharing & Collaboration UI]"
            />
          </div>
          <div className="flex-1">
            <div className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-green-600 bg-green-50 rounded-full">
              Collaboration
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              Work together, better.
            </h2>
            <p className="md:text-lg leading-relaxed mb-8">
              Share files, code snippets, and design mocks directly in the
              thread. With threaded replies and reactions, keep your
              conversations organized and expressive.
            </p>
            <button className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
              Explore collaboration tools <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </article>
      <hr className="w-full border border-border/10" />

      <article className=" py-12">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center font-semibold uppercase tracking-widest mb-8">
            Trusted by forward-thinking teams
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* You can replace these with actual logos later */}
            <div className="text-2xl font-bold text-slate-400">GITHUB</div>
            <div className="text-2xl font-bold text-slate-400">SLACK</div>
            <div className="text-2xl font-bold text-slate-400">DISCORD</div>
            <div className="text-2xl font-bold text-slate-400">NOTION</div>
          </div>
        </div>
      </article>
    </section>
  );
}

/* Sub-component for clean code */
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-bgsecondary/10 text-text p-8 rounded-2xl border border-border/20 shadow-sm hover:shadow-md transition group">
    <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-txlight leading-relaxed">{desc}</p>
  </div>
);
