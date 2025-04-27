// src/pages/SignUp.js
import { useState } from "react";
import { auth } from "../firebase";
//import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";              // ← 新增
import { db } from "../firebase";  
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", pwd: "", confirm: "" });
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const signup = async () => {
    if (form.pwd !== form.confirm) {
      setErr("Passwords do not match");
      return;
    }
    try {
      //await createUserWithEmailAndPassword(auth, form.email, form.pwd);
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.pwd);
      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
      });
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="container p-4" style={{ maxWidth: 400 }}>
      <h3 className="mb-3">Sign Up</h3>
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
      <input
        className="form-control mb-3"
        placeholder="Confirm Password"
        name="confirm"
        type="password"
        value={form.confirm}
        onChange={onChange}
      />
      <button className="btn btn-success w-100" onClick={signup}>
        Register
      </button>
      <div className="mt-2 text-center">
        Already have account? <Link to="/signin">Sign in</Link>
      </div>
    </div>
  );
}
