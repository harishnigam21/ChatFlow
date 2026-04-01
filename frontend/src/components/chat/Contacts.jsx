import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import ContactItem from "./contact/ContactItem.jsx";
import BouncingLoading from "../common/BouncingLoading.jsx";

export default function Contacts({ search, loading }) {
  const user = useSelector((store) => store.user.userInfo);
  const contact = useSelector((store) => store.user.otherUsers);
  const requests = useSelector((store) => store.user.request);
  const [status, setStatus] = useState({});
  useEffect(() => {
    if (user) {
      requests.filter((item) => {
        if (item.type == "connection" && item.sender_id._id == user._id) {
          setStatus((prev) => ({
            ...prev,
            [item.receiver_id._id]: item.status,
          }));
        }
      });
    }
  }, [requests]);

  return loading ? (
    <BouncingLoading />
  ) : (
    <article className="flex flex-col gap-2 py-2">
      {contact && contact.length > 0 ? (
        contact
          .filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((usr, index) => (
            <ContactItem
              key={`contact/list/user/${index}`}
              usr={usr}
              status={status}
            />
          ))
      ) : (
        <p>No Contact</p>
      )}
    </article>
  );
}
