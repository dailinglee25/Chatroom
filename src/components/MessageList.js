// src/components/MessageList.js
export default function MessageList({ data, userUid, onUnsend, userProfiles }) {
  return (
    <ul className="list-unstyled mb-0" style={{ height: "100%", margin: 0 }}>
      {data.map((m) => {
        const isSender = m.senderUid === userUid;
        const profile = userProfiles[m.senderUid];
        const displayName = profile && profile.displayName && profile.displayName.trim()
          ? profile.displayName
          : m.senderEmail;
        return (
          <li
            key={m.id}
            className={`my-2 d-flex flex-column ${isSender ? "align-items-end" : "align-items-start"
              }`}
          >
            {/* 顯示發送者 */}
            <div style={{ fontSize: "0.75rem", color: "#888" }}>
              {displayName}
            </div>

            {/* 訊息＋垃圾桶圖示 */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              {isSender && (
                <button
                  onClick={() => onUnsend(m.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: "0.6rem",
                    lineHeight: 1,
                  }}
                  aria-label="Unsend message"
                >
                  🗑️
                </button>
              )}

              {m.imageDataUrl ? (
                <img
                  src={m.imageDataUrl}
                  alt="sent"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    borderRadius: "0.5rem",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span
                  className={`badge rounded-pill ${isSender ? "bg-primary" : "bg-secondary"}`}
                  style={{ maxWidth: "100%", wordBreak: "break-word" }}
                >
                  {m.text}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
