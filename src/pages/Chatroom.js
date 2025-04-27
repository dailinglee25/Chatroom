// src/pages/Chatroom.js
import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

export default function Chatroom() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  /* --- 監聽 Firestore --- */
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      // 新訊息自動滑到最底
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return unsub;
  }, []);

  /* --- 發送訊息 --- */
  const send = async (text) => {
    if (!text.trim()) return;
    await addDoc(collection(db, "messages"), {
      text,
      email: user.email,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "90vh",      // 整頁固定滿版高
        maxWidth: "600px",
        margin: "0 auto",
        overflow: "hidden",   // ⬅️ 右邊不會再出現頁面卷軸
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      {/* —— 中間訊息區 —— */}
      <div
        style={{
          flex: "1 1 auto",   // 自動撐滿「剩餘」空間
          overflowY: "auto",  // 只在這裡捲動
          paddingRight: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <MessageList data={messages} email={user.email} />
        <div ref={bottomRef}></div>
      </div>

      {/* —— 底部輸入框 —— */}
      <div style={{ flex: "0 0 auto" }}>
        <MessageInput onSend={send} />
      </div>
    </div>
  );
}
