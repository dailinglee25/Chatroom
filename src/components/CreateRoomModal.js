// src/components/CreateRoomModal.jsx
import { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function CreateRoomModal({ onClose }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!name.trim()) {
      setError("請輸入聊天室名稱");
      return;
    }
    setIsCreating(true);
    setError("");

    try {
      // 1. 解析 Email 字串
      const emails = memberEmails
        .split(",")
        .map(e => e.trim())
        .filter(Boolean);

      // 2. 查出對應 uid
      const memberUids = [user.uid]; 
      for (const email of emails) {
        const q = query(
          collection(db, "users"),
          where("email", "==", email)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          console.warn(`找不到 Email: ${email} 的使用者`);
          continue;
        }
        // 假設每個 email 對應唯一一位使用者
        memberUids.push(snap.docs[0].id);
      }

      // 3. 建立 Chatroom 文件
      await addDoc(collection(db, "chatrooms"), {
        name,
        ownerUid: user.uid,
        members: Array.from(new Set(memberUids)), // 去重
        createdAt: serverTimestamp(),
      });

      // 關閉 Modal
      onClose();
    } catch (err) {
      console.error(err);
      setError("建立聊天室時發生錯誤");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{
      position: "fixed",
      top:0, left:0, right:0, bottom:0,
      background:"rgba(0,0,0,0.3)",
      display:"flex", alignItems:"center", justifyContent:"center"
    }}>
      <div className="card p-4" style={{ minWidth: 300 }}>
        <h5 className="mb-3">建立新聊天室</h5>
        {error && (
          <div className="alert alert-danger p-2">{error}</div>
        )}
        <div className="mb-2">
          <input
            className="form-control"
            placeholder="聊天室名稱"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="成員 Email（逗號分隔）"
            rows={2}
            value={memberEmails}
            onChange={e => setMemberEmails(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-secondary me-2"
            onClick={onClose}
            disabled={isCreating}
          >
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={create}
            disabled={isCreating}
          >
            {isCreating ? "建立中..." : "建立聊天室"}
          </button>
        </div>
      </div>
    </div>
  );
}
