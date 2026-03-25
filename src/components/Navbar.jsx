import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <span>JobMarket</span>
        </Link>

        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`} onClick={closeMenu}>Home</Link>
          
          {!user && (
            <>
              <Link to="/login" className="nav-btn nav-btn-outline" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="nav-btn nav-btn-primary" onClick={closeMenu}>Sign Up</Link>
            </>
          )}

          {user?.role === "jobseeker" && (
            <>
              <Link to="/jobseeker" className={`nav-link ${isActive("/jobseeker") ? "active" : ""}`} onClick={closeMenu}>Dashboard</Link>
              <Link to="/jobseeker?action=edit-profile" className="nav-link" onClick={closeMenu}>Edit Profile</Link>
            </>
          )}

          {user?.role === "employer" && (
            <>
              <Link to="/employer" className={`nav-link ${isActive("/employer") ? "active" : ""}`} onClick={closeMenu}>Dashboard</Link>
              <Link to="/employer?action=post-job" className="nav-link" onClick={closeMenu}>Post Job</Link>
              <Link to="/employer?action=edit-profile" className="nav-link" onClick={closeMenu}>Edit Profile</Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`} onClick={closeMenu}>Admin Panel</Link>
          )}

          {user && (
            <button className="nav-btn nav-btn-outline" onClick={() => { logout(); closeMenu(); }}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
