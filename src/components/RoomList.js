import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function RoomList({ activeRoom, onSelect }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "chatrooms"),
                    where("members", "array-contains", user.uid));
    const unsub = onSnapshot(q, snap => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  return (
    <ul className="list-group">
      {rooms.map(r => (
        <li key={r.id}
            className={`list-group-item ${activeRoom===r.id?"active":""}`}
            onClick={()=>onSelect(r.id)}>
          {r.name}
        </li>
      ))}
    </ul>
  );
}
