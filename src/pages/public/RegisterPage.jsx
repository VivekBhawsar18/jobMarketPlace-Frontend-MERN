import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import AlertBanner from "../../components/AlertBanner";
import api from "../../api/client";

const initialSeeker = { name: "", email: "", password: "", otp: "" };
const initialEmployer = { name: "", email: "", password: "", companyName: "", description: "", industry: "", otp: "" };

const RegisterPage = () => {
  const { registerJobSeeker, registerEmployer } = useAuth();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [seekerForm, setSeekerForm] = useState(initialSeeker);
  const [employerForm, setEmployerForm] = useState(initialEmployer);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpSentHint, setOtpSentHint] = useState("");

  const handleSendOtp = async (intent) => {
    const email = intent === "jobseeker" ? seekerForm.email : employerForm.email;
    if (!email?.trim()) {
      setError({ message: "Enter your email first, then request a code." });
      return;
    }
    setError(null);
    setOtpSentHint("");
    setOtpSending(true);
    try {
      const res = await api.post("/auth/register/otp/send", { email, intent });
      let hint = res.data.message || "Check your email for the code.";
      if (res.data.debugCode) hint += ` (Dev code: ${res.data.debugCode})`;
      setOtpSentHint(hint);
    } catch (err) {
      const d = err.response?.data;
      setError({ code: d?.code, message: d?.message || "Could not send code." });
    } finally {
      setOtpSending(false);
    }
  };

  const handleSeekerSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    try {
      await registerJobSeeker(seekerForm);
      setSuccess("Account created. Redirecting…");
      navigate("/user");
    } catch (err) {
      const d = err.response?.data;
      setError({ code: d?.code, message: d?.message || "Registration failed" });
    }
  };

  const handleEmployerSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    try {
      await registerEmployer(employerForm);
      setSuccess("Account created. Redirecting…");
      navigate("/company");
    } catch (err) {
      const d = err.response?.data;
      setError({ code: d?.code, message: d?.message || "Registration failed" });
    }
  };

  if (!flow) {
    return (
      <main className="container">
        <h2>Create account</h2>
        <p className="muted">Choose how you will use the platform.</p>
        <div className="register-choice-grid">
          <button type="button" className="card choice-card" onClick={() => setFlow("jobseeker")}>
            <h3>I&apos;m looking for a job</h3>
            <p>Browse anonymized listings and place bids.</p>
          </button>
          <button type="button" className="card choice-card" onClick={() => setFlow("employer")}>
            <h3>I&apos;m hiring</h3>
            <p>Post roles and review applicants (no direct contact).</p>
          </button>
        </div>
        <p className="muted small">
          Prefer Google? <Link to="/login">Log in with Google</Link> (new users pick role after).
        </p>
      </main>
    );
  }

  return (
    <main className="container">
      <button type="button" className="link-button" onClick={() => { setFlow(null); setError(null); setOtpSentHint(""); }}>
        ← Back
      </button>
      <h2>{flow === "jobseeker" ? "Job seeker signup" : "Employer signup"}</h2>

      {error && (
        <AlertBanner type="error" title={error.code?.replace(/_/g, " ") || "Error"}>
          {error.message}
        </AlertBanner>
      )}
      {success && <AlertBanner type="success">{success}</AlertBanner>}
      {otpSentHint && <AlertBanner type="info">{otpSentHint}</AlertBanner>}

      {flow === "jobseeker" && (
        <form onSubmit={handleSeekerSubmit} className="card form">
          <input placeholder="Full name" value={seekerForm.name} onChange={(e) => setSeekerForm({ ...seekerForm, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={seekerForm.email} onChange={(e) => setSeekerForm({ ...seekerForm, email: e.target.value })} required />
          <div className="otp-row">
            <input
              placeholder="6-digit email code"
              inputMode="numeric"
              maxLength={6}
              value={seekerForm.otp}
              onChange={(e) => setSeekerForm({ ...seekerForm, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              required
            />
            <button type="button" className="btn-secondary" disabled={otpSending} onClick={() => handleSendOtp("jobseeker")}>
              {otpSending ? "Sending…" : "Send code"}
            </button>
          </div>
          <input placeholder="Password (min 6)" type="password" value={seekerForm.password} onChange={(e) => setSeekerForm({ ...seekerForm, password: e.target.value })} required minLength={6} />
          <button type="submit">Create job seeker account</button>
        </form>
      )}

      {flow === "employer" && (
        <form onSubmit={handleEmployerSubmit} className="card form">
          <input placeholder="Your name (contact)" value={employerForm.name} onChange={(e) => setEmployerForm({ ...employerForm, name: e.target.value })} required />
          <input placeholder="Company name" value={employerForm.companyName} onChange={(e) => setEmployerForm({ ...employerForm, companyName: e.target.value })} required />
          <input placeholder="Email" type="email" value={employerForm.email} onChange={(e) => setEmployerForm({ ...employerForm, email: e.target.value })} required />
          <div className="otp-row">
            <input
              placeholder="6-digit email code"
              inputMode="numeric"
              maxLength={6}
              value={employerForm.otp}
              onChange={(e) => setEmployerForm({ ...employerForm, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              required
            />
            <button type="button" className="btn-secondary" disabled={otpSending} onClick={() => handleSendOtp("employer")}>
              {otpSending ? "Sending…" : "Send code"}
            </button>
          </div>
          <input placeholder="Password (min 6)" type="password" value={employerForm.password} onChange={(e) => setEmployerForm({ ...employerForm, password: e.target.value })} required minLength={6} />
          <input placeholder="Industry (optional)" value={employerForm.industry} onChange={(e) => setEmployerForm({ ...employerForm, industry: e.target.value })} />
          <textarea placeholder="Company description (optional)" rows={3} value={employerForm.description} onChange={(e) => setEmployerForm({ ...employerForm, description: e.target.value })} />
          <button type="submit">Create employer account</button>
        </form>
      )}
    </main>
  );
};

export default RegisterPage;
