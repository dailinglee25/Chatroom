import { Link, useNavigate } from "react-router-dom";
// import { auth, signOut } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import { useAuth } from "../contexts/AuthContext";


export default function Navbar() {
  const { user } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    nav("/signin");
  };

  return (
    <nav className="navbar navbar-light bg-light px-3">
      <Link className="navbar-brand" to="/">
        React Chatroom
      </Link>

      {user ? (
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">{user.email}</span>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <>
          <Link className="btn btn-outline-primary btn-sm mx-1" to="/signin">
            Sign In
          </Link>
          <Link className="btn btn-primary btn-sm" to="/signup">
            Sign Up
          </Link>
        </>
      )}
    </nav>
  );
}
