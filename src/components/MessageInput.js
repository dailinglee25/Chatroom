// src/components/MessageInput.js
import { useState } from "react";
import imageCompression from "browser-image-compression";


export default function MessageInput({ onSend, onSendImage }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  // const handleFileChange = (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   onSendImage(file);
  //   // 清空 input 以便下次可重選同一檔
  //   e.target.value = "";
  // };
  const handleFileChange = async (e) => {
      const origFile = e.target.files?.[0];
      if (!origFile) return;
      try {
        const options = {
          maxSizeMB: 1,             // 壓縮後最大 1 MB
          maxWidthOrHeight: 1024,   // 寬/高不超過 1024px
          useWebWorker: true,
        };
        // 壓縮
        const compressedFile = await imageCompression(origFile, options);
        console.log(
          `🗜️ 圖片壓縮：${(origFile.size/1024/1024).toFixed(2)}MB → ${(compressedFile.size/1024/1024).toFixed(2)}MB`
        );
        onSendImage(compressedFile);
      } catch (err) {
        console.error("圖片壓縮失敗，改上傳原檔：", err);
        onSendImage(origFile);
      }
      // 清空 input，讓同一檔能重選
      e.target.value = "";
    };

  return (
    <div
      className="input-group"
      style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}
    >
      {/* 隱藏的 file input */}
      <input
        type="file"
        id="image-input"
        accept=".png,.jpg,.jpeg"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {/* 樣式化成小相機 icon 的 label */}
      <label
        htmlFor="image-input"
        style={{
          cursor: "pointer",
          fontSize: "1.2rem",
          lineHeight: 1,
          userSelect: "none",
        }}
        title="Send Photo"
      >
        📷
      </label>

      {/* 文字輸入框 */}
      <input
        className="form-control"
        placeholder="Type message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />

      {/* 傳送按鈕 */}
      <button className="btn btn-primary" onClick={submit}>
        Send
      </button>
    </div>
  );
}
