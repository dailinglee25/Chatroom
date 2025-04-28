// src/pages/Chatroom.js
import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { deleteDoc, doc } from "firebase/firestore";
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
  const bottomRef = useRef(null);

  // 刪除訊息
  const handleUnsend = async (msgId) => {
    if (!roomId) return;
    console.log("🗑️ Unsend message:", msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));

    try {
      await deleteDoc(doc(db, "chatrooms", roomId, "messages", msgId));
      console.log("✅ deleteDoc 成功");
    } catch (e) {
      console.error("Unsend failed:", e);
      console.error("❌ deleteDoc 失败：", e.code, e.message);
    }
  }

    // 1️⃣ 訂閱「我所屬的聊天室清單」
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

    // 2️⃣ 當選中 roomId，訂閱對應 messages
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
        // 新增訊息通知
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
        // 更新訊息列表並滾到底
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(msgs);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      return unsub;
    }, [roomId]);

    // 3️⃣ 發送訊息到當前聊天室
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

    return (
      <>
        <div style={{
          display: "flex",
          height: "90vh",
          maxWidth: "900px",
          margin: "0 auto",
          boxSizing: "border-box",
        }}>
          {/* —— 左側：聊天室列表 & 新增按鈕 —— */}
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

          {/* —— 右側：選中聊天室的訊息 & 輸入框 —— */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
          }}>
            {/* Chatroom 標題 */}
            <h5 style={{ marginBottom: "1rem" }}>
              {rooms.find(r => r.id === roomId)?.name || "Select a room"}
            </h5>

            {/* 訊息列表（可捲動） */}
            <div style={{
              flex: "1 1 auto",
              overflowY: "auto",
              marginBottom: "0.5rem",
            }}>
              <MessageList
                data={messages}
                userUid={user.uid}
                onUnsend={handleUnsend}    // ← 傳入這個 prop
              />
              <div ref={bottomRef}></div>
            </div>

            {/* 輸入框（固定） */}
            <div style={{ flex: "0 0 auto" }}>
              <MessageInput onSend={send} />
            </div>
          </div>
        </div>

        {/* —— 建房間 Modal —— */}
        {showModal && (
          <CreateRoomModal onClose={() => setShowModal(false)} />
        )}
      </>
    );
  }
