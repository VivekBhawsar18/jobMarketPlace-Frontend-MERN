import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import AlertBanner from "../../components/AlertBanner";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    const oauth = params.get("oauth");
    const msg = params.get("msg");
    if (!oauth || oauth === "success") return;

    const decoded = msg ? decodeURIComponent(msg) : null;
    const map = {
      failed: "Google sign-in failed. Try again.",
      OAUTH_ACCOUNT_TYPE_MISMATCH: decoded || "Google sign-in could not match your account.",
      OAUTH_DENIED: decoded || "Sign-in was cancelled.",
    };
    setError({
      code: oauth,
      message: map[oauth] || decoded || "Something went wrong with Google sign-in.",
    });
    setParams({}, { replace: true });
  }, [params, setParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userData = await login(form.email, form.password);
      if (userData.role === 'admin') navigate("/admin");
      else if (userData.role === 'employer') navigate("/employer");
      else if (userData.role === 'jobseeker') navigate("/jobseeker");
      else navigate("/");
    } catch (err) {
      const d = err.response?.data;
      setError({
        code: d?.code,
        message: d?.message || "Login failed",
      });
    }
  };

  return (
    <main className="container" style={{ maxWidth: "420px", marginTop: "3rem", marginBottom: "3rem" }}>
      <div className="card" style={{ padding: "2rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Welcome Back</h2>
          <p className="muted" style={{ margin: 0 }}>Log in to access your account</p>
        </div>

        {error && (
          <div style={{ marginBottom: "1.5rem" }}>
            <AlertBanner type="error" title={error.code?.replace(/_/g, " ") || "Login error"}>
              {error.message}
            </AlertBanner>
          </div>
        )}

        <form onSubmit={onSubmit} className="form" style={{ gap: "1.25rem", marginBottom: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Email Address</label>
            <input placeholder="Enter your email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Password</label>
            <input placeholder="Enter your password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" style={{ marginTop: "0.5rem", width: "100%", fontWeight: 600, padding: "0.85rem", fontSize: "1rem" }}>
            Log in
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "1.75rem 0" }}>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e2e8f0" }} />
          <span style={{ padding: "0 0.85rem", color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>OR</span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e2e8f0" }} />
        </div>

        <section style={{ padding: "0", margin: "0", border: "none", boxShadow: "none", textAlign: "center" }}>
          <a href={`${apiBase}/auth/google`} style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "100%",
            padding: "0.7rem 1rem",
            backgroundColor: "#fff",
            color: "#3c4043",
            border: "1px solid #dadce0",
            borderRadius: "8px",
            fontWeight: 500,
            textDecoration: "none",
            boxShadow: "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
            fontSize: "0.95rem"
          }}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </a>
          <p className="muted small" style={{ marginTop: "1rem", marginBottom: 0 }}>
            New? After Google, you&apos;ll choose job seeker or employer once.
          </p>
        </section>
      </div>

      <p className="muted small" style={{ textAlign: "center", margin: "1.5rem 0" }}>
        Don&apos;t have an account? <Link to="/register" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Register here</Link>
      </p>
    </main>
  );
};

export default LoginPage;
