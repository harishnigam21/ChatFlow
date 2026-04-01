import BouncingLoading from "../common/BouncingLoading";
import ByYou from "./request/ByYou";
import ForYou from "./request/ForYou";

export default function Requests({ loading }) {
  return loading ? (
    <BouncingLoading />
  ) : (
    <section className="flex flex-col gap-8">
      {/* by you */}
      <ByYou />
      {/* for you */}
      <ForYou />
    </section>
  );
}
