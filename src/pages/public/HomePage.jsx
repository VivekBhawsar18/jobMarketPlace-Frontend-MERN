import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate("/admin");
      else if (user.role === 'employer') navigate("/employer");
      else if (user.role === 'jobseeker') navigate("/jobseeker");
    }
  }, [user, navigate]);

  return (
    <main className="container">
      <section className="hero">
        <h1>Connect. Bid. <span style={{ color: '#2563eb' }}>Hire.</span></h1>
        <p>The specialized marketplace for admin-mediated hiring. Secure, anonymized, and efficient.</p>
        <div className="hero-btns">
          {!user ? (
            <>
              <Link to="/register" className="btn-lg btn-primary">Get Started</Link>
              <Link to="/login" className="btn-lg btn-outline">Sign In</Link>
            </>
          ) : (
            <Link to={user.role === 'admin' ? '/admin' : user.role === 'employer' ? '/employer' : '/jobseeker'} className="btn-lg btn-primary">
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      <section className="section-title">
        <h2>How it works</h2>
      </section>

      <div className="features-grid">
        <article className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Anonymized Listings</h3>
          <p>Companies post jobs without revealing their identity until the final stages, ensuring fair evaluation.</p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">⚖️</div>
          <h3>Admin Mediated</h3>
          <p>Every transaction and communication is mediated by our admin team to ensure quality and security.</p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Competitive Bidding</h3>
          <p>Job seekers place bids on roles, allowing for market-driven pricing and efficient hiring.</p>
        </article>
      </div>
    </main>
  );
};

export default HomePage;
