import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">JobMarketPlace</Link>
        <nav className="nav-links">
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register">Register</Link>}
          {user?.role === "jobseeker" && <Link to="/jobseeker">Job Seeker Dashboard</Link>}
          {user?.role === "employer" && <Link to="/employer">Employer Dashboard</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
          {user && <button onClick={logout}>Logout</button>}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
