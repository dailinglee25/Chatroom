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
            {/* 頭像圓形框 */}

            <div style={{ position: "relative", paddingLeft: !isSender ? 40 : 0, marginTop: !isSender ? 10 : 0 }}>
              {/* 對方的頭像（定位在左上角） */}
              {!isSender && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#eee",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {profile?.photoDataUrl ? (
                    <img
                      src={profile.photoDataUrl}
                      alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: "1rem", color: "#888" }}>👤</span>
                  )}
                </div>
              )}

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
            </div>
          </li>
        );
      })}
    </ul>
  );
}
