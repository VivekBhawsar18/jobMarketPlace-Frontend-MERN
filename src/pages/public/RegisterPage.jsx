import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import AlertBanner from "../../components/AlertBanner";
import api from "../../api/client";

const initialSeeker = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "", otp: "" };
const initialEmployer = { name: "", email: "", password: "", confirmPassword: "", companyName: "", description: "", industry: "", otp: "" };

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
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[a-zA-Z]/.test(pass)) return "Password must contain at least one letter.";
    if (!/\d/.test(pass)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(pass)) return "Password must contain at least one special character.";
    return null;
  };

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
      setCooldown(60);
    } catch (err) {
      const d = err.response?.data;
      if (d?.code === "OTP_COOLDOWN") {
        // Extract number from message like "Please wait 53s..."
        const match = d.message.match(/(\d+)/);
        if (match) setCooldown(parseInt(match[1]));
      }
      setError({ code: d?.code, message: d?.message || "Could not send code." });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (intent) => {
    const email = intent === "jobseeker" ? seekerForm.email : employerForm.email;
    const otp = intent === "jobseeker" ? seekerForm.otp : employerForm.otp;
    if (!otp || otp.length !== 6) return;
    setError(null);
    setOtpVerifying(true);
    try {
      await api.post("/auth/register/otp/verify", { email, intent, otp });
      setOtpVerified(true);
      setSuccess("Code verified! You may now complete registration.");
      setOtpSentHint("");
    } catch (err) {
      const d = err.response?.data;
      setError({ code: d?.code, message: d?.message || "Invalid code." });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSeekerSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    const passErr = validatePassword(seekerForm.password);
    if (passErr) {
      setError({ message: passErr });
      return;
    }
    if (seekerForm.password !== seekerForm.confirmPassword) {
      setError({ message: "Passwords do not match." });
      return;
    }

    try {
      const { confirmPassword, ...dataWithoutConfirm } = seekerForm;
      const formToSend = {
        ...dataWithoutConfirm,
        name: `${seekerForm.firstName} ${seekerForm.lastName}`.trim()
      };
      await registerJobSeeker(formToSend);
      setSuccess("Account created. Redirecting…");
      navigate("/");
    } catch (err) {
      const d = err.response?.data;
      setError({ code: d?.code, message: d?.message || "Registration failed" });
    }
  };

  const handleEmployerSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    const passErr = validatePassword(employerForm.password);
    if (passErr) {
      setError({ message: passErr });
      return;
    }
    if (employerForm.password !== employerForm.confirmPassword) {
      setError({ message: "Passwords do not match." });
      return;
    }

    try {
      const { confirmPassword, ...dataWithoutConfirm } = employerForm;
      await registerEmployer(dataWithoutConfirm);
      setSuccess("Account created. Redirecting…");
      navigate("/employer");
    } catch (err) {
      const d = err.response?.data;
      setError({ code: d?.code, message: d?.message || "Registration failed" });
    }
  };

  if (!flow) {
    return (
      <main className="container" style={{ maxWidth: "420px", marginTop: "3rem", marginBottom: "3rem" }}>
        <div className="card" style={{ padding: "2rem 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Create Account</h2>
            <p className="muted" style={{ margin: 0 }}>Choose how you will use the platform</p>
          </div>

          <div className="register-choice-grid" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: 0 }}>
            <button type="button" className="card choice-card" onClick={() => setFlow("jobseeker")} style={{ padding: "1.25rem", textAlign: "left" }}>
              <h3 style={{ margin: "0 0 0.25rem", color: "#0f172a", fontSize: "1.1rem" }}>I&apos;m looking for a job</h3>
              <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem" }}>Browse anonymized listings and place bids.</p>
            </button>
            <button type="button" className="card choice-card" onClick={() => setFlow("employer")} style={{ padding: "1.25rem", textAlign: "left" }}>
              <h3 style={{ margin: "0 0 0.25rem", color: "#0f172a", fontSize: "1.1rem" }}>I&apos;m hiring</h3>
              <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem" }}>Post roles and review applicants (no direct contact).</p>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", margin: "1.75rem 0" }}>
            <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e2e8f0" }} />
            <span style={{ padding: "0 0.85rem", color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>OR</span>
            <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e2e8f0" }} />
          </div>

          <section style={{ padding: "0", margin: "0", border: "none", boxShadow: "none", textAlign: "center" }}>
            <Link to="/login" style={{
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
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Sign in with Google
            </Link>
            <p className="muted small" style={{ marginTop: "1rem", marginBottom: 0 }}>
              Prefer Google? New users will pick a role after logging in.
            </p>
          </section>
        </div>

        <p className="muted small" style={{ textAlign: "center", margin: "1.5rem 0" }}>
          Already have an account? <Link to="/login" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Log in here</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: "420px", marginTop: "3rem", marginBottom: "3rem" }}>
      <div className="card" style={{ padding: "2rem 1.5rem" }}>
        <button type="button" className="link-button" onClick={() => { setFlow(null); setError(null); setOtpSentHint(""); setOtpVerified(false); }} style={{ marginBottom: "1rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#64748b", fontWeight: 500, fontSize: "0.9rem", background: "transparent", border: "none", padding: 0 }}>
          ← Back
        </button>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>{flow === "jobseeker" ? "Job Seeker Signup" : "Employer Signup"}</h2>
          <p className="muted" style={{ margin: 0 }}>Fill in your details to create an account</p>
        </div>

        {error && (
          <div style={{ marginBottom: "1rem" }}>
            <AlertBanner type="error" title={error.code?.replace(/_/g, " ") || "Error"}>
              {error.message}
            </AlertBanner>
          </div>
        )}
        {success && <div style={{ marginBottom: "1rem" }}><AlertBanner type="success">{success}</AlertBanner></div>}
        {cooldown > 0 && !otpVerified && (
          <div style={{ marginBottom: "1rem" }}>
            <AlertBanner type="error" title="OTP COOLDOWN">
              Please wait {cooldown}s before requesting another code.
            </AlertBanner>
          </div>
        )}
        {otpSentHint && <div style={{ marginBottom: "1rem" }}><AlertBanner type="info">{otpSentHint}</AlertBanner></div>}

        {flow === "jobseeker" && (
          <form onSubmit={handleSeekerSubmit} className="form" style={{ gap: "1.25rem", marginBottom: 0 }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>First Name</label>
                <input 
                  placeholder="First name" 
                  value={seekerForm.firstName} 
                  onChange={(e) => setSeekerForm({ ...seekerForm, firstName: e.target.value })} 
                  required 
                  disabled={!!otpSentHint || otpVerified}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", opacity: (otpSentHint || otpVerified) ? 0.7 : 1 }} 
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Last Name</label>
                <input 
                  placeholder="Last name" 
                  value={seekerForm.lastName} 
                  onChange={(e) => setSeekerForm({ ...seekerForm, lastName: e.target.value })} 
                  required 
                  disabled={!!otpSentHint || otpVerified}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", opacity: (otpSentHint || otpVerified) ? 0.7 : 1 }} 
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Email Address</label>
              <input 
                placeholder="Enter your email" 
                type="email" 
                value={seekerForm.email} 
                onChange={(e) => setSeekerForm({ ...seekerForm, email: e.target.value })} 
                required 
                disabled={!!otpSentHint || otpVerified}
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", opacity: (otpSentHint || otpVerified) ? 0.7 : 1 }} 
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Verification Code</label>
              <div className="otp-row" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  placeholder="6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                  value={seekerForm.otp}
                  onChange={(e) => { setSeekerForm({ ...seekerForm, otp: e.target.value.replace(/\D/g, "").slice(0, 6) }); setOtpVerified(false); }}
                  required
                  disabled={otpVerified}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
                {!otpVerified ? (
                  <button type="button" className="btn-secondary" disabled={otpSending || otpVerified || cooldown > 0} onClick={() => handleSendOtp("jobseeker")} style={{ padding: "0.75rem 1rem", borderRadius: "8px", fontWeight: 500 }}>
                    {otpSending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Send code"}
                  </button>
                ) : (
                  <span style={{ color: "#10b981", fontWeight: 600, padding: "0 0.5rem", whiteSpace: "nowrap" }}>✓ Verified</span>
                )}
              </div>
              {!otpVerified && (
                 <button type="button" onClick={() => handleVerifyOtp("jobseeker")} disabled={otpVerifying || seekerForm.otp.length !== 6} style={{ marginTop: "0.25rem", padding: "0.75rem", backgroundColor: seekerForm.otp.length === 6 ? "#10b981" : "#e2e8f0", color: seekerForm.otp.length === 6 ? "white" : "#94a3b8", borderRadius: "8px", border: "none", fontWeight: 600, cursor: seekerForm.otp.length === 6 ? "pointer" : "not-allowed" }}>
                    {otpVerifying ? "Verifying..." : "Verify Code"}
                 </button>
              )}
            </div>
            {otpVerified && (
              <>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Password</label>
                    <input placeholder="Min 8 characters" type="password" value={seekerForm.password} onChange={(e) => setSeekerForm({ ...seekerForm, password: e.target.value })} required style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Confirm Password</label>
                    <input placeholder="Repeat password" type="password" value={seekerForm.confirmPassword} onChange={(e) => setSeekerForm({ ...seekerForm, confirmPassword: e.target.value })} required style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
                <p style={{ marginTop: "-0.5rem", fontSize: "0.8rem", color: "#64748b" }}>Mix of numbers, alphabets and special characters.</p>
                <button type="submit" style={{ marginTop: "0.5rem", width: "100%", fontWeight: 600, padding: "0.85rem", fontSize: "1rem", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                  Create Account
                </button>
              </>
            )}
          </form>
        )}

        {flow === "employer" && (
          <form onSubmit={handleEmployerSubmit} className="form" style={{ gap: "1.25rem", marginBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Contact Name</label>
              <input 
                placeholder="Your full name" 
                value={employerForm.name} 
                onChange={(e) => setEmployerForm({ ...employerForm, name: e.target.value })} 
                required 
                disabled={!!otpSentHint || otpVerified}
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", opacity: (otpSentHint || otpVerified) ? 0.7 : 1 }} 
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Company Name</label>
              <input 
                placeholder="Enter company name" 
                value={employerForm.companyName} 
                onChange={(e) => setEmployerForm({ ...employerForm, companyName: e.target.value })} 
                required 
                disabled={!!otpSentHint || otpVerified}
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", opacity: (otpSentHint || otpVerified) ? 0.7 : 1 }} 
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Email Address</label>
              <input 
                placeholder="Enter work email" 
                type="email" 
                value={employerForm.email} 
                onChange={(e) => setEmployerForm({ ...employerForm, email: e.target.value })} 
                required 
                disabled={!!otpSentHint || otpVerified}
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", opacity: (otpSentHint || otpVerified) ? 0.7 : 1 }} 
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Verification Code</label>
              <div className="otp-row" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  placeholder="6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                  value={employerForm.otp}
                  onChange={(e) => { setEmployerForm({ ...employerForm, otp: e.target.value.replace(/\D/g, "").slice(0, 6) }); setOtpVerified(false); }}
                  required
                  disabled={otpVerified}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
                {!otpVerified ? (
                  <button type="button" className="btn-secondary" disabled={otpSending || otpVerified || cooldown > 0} onClick={() => handleSendOtp("employer")} style={{ padding: "0.75rem 1rem", borderRadius: "8px", fontWeight: 500 }}>
                    {otpSending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Send code"}
                  </button>
                ) : (
                  <span style={{ color: "#10b981", fontWeight: 600, padding: "0 0.5rem", whiteSpace: "nowrap" }}>✓ Verified</span>
                )}
              </div>
              {!otpVerified && (
                 <button type="button" onClick={() => handleVerifyOtp("employer")} disabled={otpVerifying || employerForm.otp.length !== 6} style={{ marginTop: "0.25rem", padding: "0.75rem", backgroundColor: employerForm.otp.length === 6 ? "#10b981" : "#e2e8f0", color: employerForm.otp.length === 6 ? "white" : "#94a3b8", borderRadius: "8px", border: "none", fontWeight: 600, cursor: employerForm.otp.length === 6 ? "pointer" : "not-allowed" }}>
                    {otpVerifying ? "Verifying..." : "Verify Code"}
                 </button>
              )}
            </div>
            {otpVerified && (
              <>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Password</label>
                    <input placeholder="Min 8 characters" type="password" value={employerForm.password} onChange={(e) => setEmployerForm({ ...employerForm, password: e.target.value })} required style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Confirm Password</label>
                    <input placeholder="Repeat password" type="password" value={employerForm.confirmPassword} onChange={(e) => setEmployerForm({ ...employerForm, confirmPassword: e.target.value })} required style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
                <p style={{ marginTop: "-0.5rem", fontSize: "0.8rem", color: "#64748b" }}>Mix of numbers, alphabets and special characters.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Industry (Optional)</label>
                  <input placeholder="e.g. Technology, Healthcare" value={employerForm.industry} onChange={(e) => setEmployerForm({ ...employerForm, industry: e.target.value })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#475569" }}>Company Description (Optional)</label>
                  <textarea placeholder="Briefly describe your company..." rows={3} value={employerForm.description} onChange={(e) => setEmployerForm({ ...employerForm, description: e.target.value })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "vertical" }} />
                </div>
                <button type="submit" style={{ marginTop: "0.5rem", width: "100%", fontWeight: 600, padding: "0.85rem", fontSize: "1rem", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                  Create Account
                </button>
              </>
            )}
          </form>
        )}
      </div>

      <p className="muted small" style={{ textAlign: "center", margin: "1.5rem 0" }}>
        Already have an account? <Link to="/login" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Log in here</Link>
      </p>
    </main>
  );
};

export default RegisterPage;
