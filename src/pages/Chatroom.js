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
//import { deleteDoc, doc } from "firebase/firestore";
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
  const [userProfiles, setUserProfiles] = useState({});

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
    // 4️⃣ 發送圖片：壓縮→轉 Base64→寫 Firestore（帶日志 & 錯誤處理）
    const sendImage = async (file) => {
      console.log("[sendImage] 開始，file:", file, "roomId:", roomId);
      if (!file || !roomId) {
        console.warn("[sendImage] 無效的 file 或 roomId");
        return;
      }
      try {
        // 1️⃣ 壓縮
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        let toUpload = file;
        const compressed = await imageCompression(file, options);
        console.log(
          `[sendImage] 壓縮：${(file.size/1024/1024).toFixed(2)}→${(compressed.size/1024/1024).toFixed(2)} MB`
        );
        toUpload = compressed;
  
        // 2️⃣ 轉 Base64
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(toUpload);
        });
        console.log("[sendImage] Data URL 長度:", dataUrl.length);
  
        // 3️⃣ 寫入 Firestore
        const docRef = await addDoc(
          collection(db, "chatrooms", roomId, "messages"),
          {
            imageDataUrl: dataUrl,
            senderUid:    user.uid,
            senderEmail:  user.email,
            createdAt:    serverTimestamp(),
          }
        );
        console.log("[sendImage] Firestore 新增成功，docId:", docRef.id);
      } catch (error) {
        console.error("[sendImage] 錯誤：", error);
        alert("圖片上傳失敗：" + error.message);
      }
    };

     const filteredMessages = messages.filter((m) => {
         // 如果是圖片訊息（沒有 text，只有 imageDataUrl）就直接回傳 true
         if (m.imageDataUrl) return true;
         // 否則照原本邏輯，依文字搜尋
         return m.text?.toLowerCase().includes(searchTerm.toLowerCase());
       });

  const addMember = async () => {
    if (!roomId) return;
    // 跳出 prompt 請你輸入要新增成員的 Email
    const email = window.prompt("Enter the new member's email:");
    if (!email) return;
    try {
      // 1) 從 users collection 找對應的 uid
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("No user found with that email.");
        return;
      }
      const uid = snap.docs[0].id;

      // 2) 把 uid 用 arrayUnion 加到 chatroom.members
      //const roomDoc = docRef(db, "chatrooms", roomId);
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {rooms.find(r => r.id === roomId)?.name || "Select a room"}
            </h5>
            <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
              {/* Add member 按钮 */}
              <button className="btn btn-sm btn-outline-secondary" onClick={addMember}>
                +
              </button>
              {/* 切换搜寻栏 */}
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowSearch(prev => !prev)}
                title="Search messages"
              >
                🔍
              </button>
            </div>
          </div>

          {/* —— 搜尋框—— */}
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

          {/* 訊息列表（可捲動） */}
          <div style={{
            flex: "1 1 auto",
            overflowY: "auto",
            marginBottom: "0.5rem",
          }}>
            { }
            <MessageList
              data={filteredMessages}
              userUid={user.uid}
              onUnsend={handleUnsend}
              userProfiles={userProfiles}
            />
            <div ref={bottomRef}></div>
          </div>

          {/* 輸入框（固定） */}
          <div style={{ flex: "0 0 auto" }}>
            <MessageInput onSend={send}
              onSendImage={sendImage}
            />
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
