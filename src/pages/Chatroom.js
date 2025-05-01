// src/pages/Chatroom.js
import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

import RoomList from "../components/RoomList";
import CreateRoomModal from "../components/CreateRoomModal";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

export default function Chatroom() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});

  const bottomRef = useRef(null);

  const handleUnsend = async (msgId) => {
    if (!roomId) return;
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await deleteDoc(doc(db, "chatrooms", roomId, "messages", msgId));
    } catch (e) {
      console.error("Unsend failed:", e);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "chatrooms"),
      where("members", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRooms(list);
      if (!roomId && list.length > 0) {
        setRoomId(list[0].id);
      }
    });
    return unsub;
  }, [user.uid, roomId]);

  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, "chatrooms", roomId, "messages"),
      orderBy("createdAt")
    );

    if ("Notification" in window) {
      Notification.requestPermission();
    }
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(change => {
        if (change.type === "added") {
          const msg = change.doc.data();
          if (
            msg.senderUid !== user.uid &&
            document.hidden &&
            Notification.permission === "granted"
          ) {
            new Notification("新訊息", {
              body: `${msg.senderEmail}: ${msg.text}`,
              icon: "/favicon.ico",
            });
          }
        }
      });
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return unsub;
  }, [roomId]);

  useEffect(() => {
    const uids = Array.from(new Set(messages.map(m => m.senderUid)));
    uids.forEach(uid => {
      if (!userProfiles[uid]) {
        getDoc(doc(db, "users", uid)).then(snap => {
          if (snap.exists()) {
            setUserProfiles(prev => ({ ...prev, [uid]: snap.data() }));
          }
        });
      }
    });
  }, [messages, userProfiles]);

  const send = async (text) => {
    if (!text.trim() || !roomId) return;
    await addDoc(
      collection(db, "chatrooms", roomId, "messages"),
      {
        text,
        senderUid: user.uid,
        senderEmail: user.email,
        createdAt: serverTimestamp(),
      }
    );
  };

  const sendImage = async (file) => {
    if (!file || !roomId) return;
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressed = await imageCompression(file, options);
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });
      await addDoc(
        collection(db, "chatrooms", roomId, "messages"),
        {
          imageDataUrl: dataUrl,
          senderUid: user.uid,
          senderEmail: user.email,
          createdAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error("[sendImage] 錯誤：", error);
      alert("圖片上傳失敗：" + error.message);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (m.imageDataUrl) return true;
    return m.text?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const addMember = async () => {
    if (!roomId) return;
    const email = window.prompt("Enter the new member's email:");
    if (!email) return;
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("No user found with that email.");
        return;
      }
      const uid = snap.docs[0].id;
      const roomDoc = doc(db, "chatrooms", roomId);
      await updateDoc(roomDoc, {
        members: arrayUnion(uid),
      });
      alert(`Added ${email} to this chat.`);
    } catch (e) {
      console.error("Add member failed:", e);
      alert("Failed to add member. See console.");
    }
  };

  return (
    <>
      <div style={{
        display: "flex",
        height: "90vh",
        maxWidth: "900px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}>
        {showSidebar && (
          <div style={{
            width: "250px",
            borderRight: "1px solid #ddd",
            padding: "1rem",
          }}>
            <button
              className="btn btn-outline-primary w-100 mb-3"
              onClick={() => setShowModal(true)}
            >
              + New Room
            </button>
            <RoomList
              activeRoom={roomId}
              onSelect={setRoomId}
            />
          </div>
        )}

        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
        }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {rooms.find(r => r.id === roomId)?.name || "Select a room"}
            </h5>
            <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
              <button className="btn btn-sm btn-outline-secondary" onClick={addMember}>
                +
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowSearch(prev => !prev)}
                title="Search messages"
              >
                🔍
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowSidebar(prev => !prev)}
                title="Toggle sidebar"
              >
                {showSidebar ? "⬅" : "➡"}
              </button>
            </div>
          </div>

          {showSearch && (
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Search messages…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          )}

          <div style={{
            flex: "1 1 auto",
            overflowY: "auto",
            marginBottom: "0.5rem",
          }}>
            <MessageList
              data={filteredMessages}
              userUid={user.uid}
              onUnsend={handleUnsend}
              userProfiles={userProfiles}
            />
            <div ref={bottomRef}></div>
          </div>

          {/* ✅ 只有當 roomId 存在時才顯示輸入框 */}
          {roomId && (
            <div style={{ flex: "0 0 auto" }}>
              <MessageInput onSend={send} onSendImage={sendImage} />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CreateRoomModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
