// src/components/Navbar.js
import { Link, useNavigate, useLocation } from "react-router-dom";  // 新增 useLocation
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();                           // 取得目前路徑
  const hideAuth = pathname === "/signin" || pathname === "/signup";  // 判斷是否要隱藏

  const handleLogout = async () => {
    await signOut(auth);
    nav("/signin");
  };

  return (
    <nav className="navbar navbar-light bg-light px-3">
      <Link className="navbar-brand" to="/">
        Chatroom
      </Link>

      {user ? (
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">{user.email}</span>
          <Link className="btn btn-outline-primary btn-sm" to="/profile">Profile</Link>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        !hideAuth && (
          <>
            <Link className="btn btn-outline-primary btn-sm mx-1" to="/signin">
              Sign In
            </Link>
            <Link className="btn btn-primary btn-sm" to="/signup">
              Sign Up
            </Link>
          </>
        )
      )}
    </nav>
  );
}
