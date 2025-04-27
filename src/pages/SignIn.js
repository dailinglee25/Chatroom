// src/pages/SignIn.js
import { useState } from "react";
// import {
//     auth,
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from "../firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";


export default function SignIn() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", pwd: "" });
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, form.email, form.pwd);
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  };

  const google = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  };

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
