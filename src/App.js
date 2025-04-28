// src/App.js
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Chatroom from "./pages/Chatroom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const root = document.getElementById("root");
    // Mount 時加上 fade-in
    root.classList.remove("fade-out");
    root.classList.add("fade-in");
    // 清理：卸載前移除 class
    return () => {
      root.classList.remove("fade-in");
    };
  }, [location.pathname]);  // 路由改變就執行一次

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={user ? <Chatroom /> : <Navigate to="/signin" replace />}
        />
        {/* /signin、/signup 永远渲染，由组件内部来跳转 */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </>
  );
}
