// src/pages/SignIn.js
//import { useState } from "react";
import { useState, useEffect } from "react";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../App.css"; // 確保 CSS 已載入

export default function SignIn() {
  const nav = useNavigate();
  const {user} = useAuth();
  const [form, setForm] = useState({ email: "", pwd: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false); // 控制齒輪動畫
  useEffect(() => {
    if (user && !loading) {
      nav("/");
    }
  }, [user, loading, nav]);
  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSuccess = () => {
    setLoading(true);
    setTimeout(() => nav("/"), 1500);
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, form.email, form.pwd);
      handleSuccess();
    } catch (e) {
      setErr(e.message);
    }
  };

  const google = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      handleSuccess();
    } catch (e) {
      setErr(e.message);
    }
  };

  // 如果正在 loading，就只顯示齒輪動畫 Overlay
  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="gear-icon">⚙️</div>
        <div className="loading-text">Loading…</div>
      </div>
    );
  }

  return (
    <div className="container p-4" style={{ maxWidth: 400 }}>
      <h3 className="mb-3">Sign In</h3>
      {err && <div className="alert alert-danger">{err}</div>}
      <input
        className="form-control mb-2"
        placeholder="Email"
        name="email"
        value={form.email}
        onChange={onChange}
      />
      <input
        className="form-control mb-2"
        placeholder="Password"
        name="pwd"
        type="password"
        value={form.pwd}
        onChange={onChange}
      />
      <button className="btn btn-primary w-100 mb-2" onClick={login}>
        Sign In
      </button>
      <button className="btn btn-outline-danger w-100" onClick={google}>
        Google
      </button>
      <div className="mt-2 text-center">
        No account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}
