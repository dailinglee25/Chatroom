// src/components/MessageList.js
export default function MessageList({ data, email }) {
  return (
    <ul
      className="list-unstyled mb-0"
      style={{
        height: "100%",        // 填滿父層 (flex 容器)
        margin: 0,
        paddingRight: "0.5rem",
      }}
    >
      {data.map((m) => (
        <li
          key={m.id}
          className={`my-2 d-flex flex-column ${
            m.email === email ? "align-items-end" : "align-items-start"
          }`}
        >
          <div style={{ fontSize: "0.75rem", color: "#888" }}>
            {m.email || "Unknown"}
          </div>

          <span
            className={`badge rounded-pill ${
              m.email === email ? "bg-primary" : "bg-secondary"
            }`}
            style={{ maxWidth: "70%", wordBreak: "break-word" }}
          >
            {m.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
