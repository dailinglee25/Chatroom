import { useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;   // ✅ 順便加防止空訊息
    onSend(text);
    setText("");                // ✅ 送出後清空
  };

  return (
    <div className="input-group" style={{ marginTop: 0 }}>
      <input
        className="form-control"
        placeholder="Type message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button className="btn btn-primary" onClick={submit}>
        Send
      </button>
    </div>
  );
}
