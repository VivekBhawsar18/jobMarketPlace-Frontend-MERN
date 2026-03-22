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
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : user.role === "company" ? "/company" : "/user");
    } catch (err) {
      const d = err.response?.data;
      setError({
        code: d?.code,
        message: d?.message || "Login failed",
      });
    }
  };

  return (
    <main className="container">
      <h2>Login</h2>
      {error && (
        <AlertBanner type="error" title={error.code?.replace(/_/g, " ") || "Login error"}>
          {error.message}
        </AlertBanner>
      )}

      <section className="card oauth-block login-google-card">
        <p className="login-lead">Continue with Google</p>
        <a className="google-button" href={`${apiBase}/auth/google`}>
          <span className="google-icon" aria-hidden>G</span>
          Continue with Google
        </a>
        <p className="muted small">New? After Google, you&apos;ll choose job seeker or employer once.</p>
      </section>

      <p className="muted">
        <button type="button" className="link-button" onClick={() => setShowEmailLogin((v) => !v)}>
          {showEmailLogin ? "Hide email login" : "Use email & password instead (e.g. admin)"}
        </button>
      </p>

      {showEmailLogin && (
        <form onSubmit={onSubmit} className="card form">
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit">Login</button>
        </form>
      )}

      <p className="muted small">
        No account? <Link to="/register">Register</Link>
      </p>
    </main>
  );
};

export default LoginPage;
