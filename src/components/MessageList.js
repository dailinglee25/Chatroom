// src/components/MessageList.js
export default function MessageList({ data, userUid }) {
  return (
    <ul className="list-unstyled mb-0" style={{ height: "100%", margin: 0 }}>
      {data.map((m) => (
        <li
          key={m.id}
          className={`my-2 d-flex flex-column ${
            m.senderUid === userUid ? "align-items-end" : "align-items-start"
          }`}
        >
          {/* 顯示發送者 */}
          <div style={{ fontSize: "0.75rem", color: "#888" }}>
            {m.senderEmail}
          </div>
          {/* 顯示訊息 */}
          <span
            className={`badge rounded-pill ${
              m.senderUid === userUid ? "bg-primary" : "bg-secondary"
            }`}
            style={{ maxWidth: "100%", wordBreak: "break-word" }}
          >
            {m.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
