import { Routes, Route, Navigate } from "react-router-dom";
import Chatroom from "./pages/Chatroom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={user ? <Chatroom /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/signin"
          element={user ? <Navigate to="/" replace /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignUp />}
        />
      </Routes>
    </>
  );
}
