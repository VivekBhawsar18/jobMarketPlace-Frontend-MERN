import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import AlertBanner from "../../components/AlertBanner";

const OauthGoogleRolePage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const pendingToken = useMemo(() => params.get("pending") || "", [params]);
  const [accountType, setAccountType] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!pendingToken) {
    return (
      <main className="container">
        <AlertBanner type="error">Missing sign-in token. Start again from login.</AlertBanner>
        <button type="button" onClick={() => navigate("/login")}>Back to login</button>
      </main>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!accountType) {
      setError({ message: "Choose whether you are a job seeker or hiring." });
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/google/complete", {
        pendingToken,
        accountType,
        companyName: accountType === "employer" ? companyName.trim() : undefined,
      });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      const r = res.data.user.role;
      navigate(r === "admin" ? "/admin" : r === "employer" ? "/employer" : "/jobseeker");
    } catch (err) {
      const d = err.response?.data;
      setError({ code: d?.code, message: d?.message || "Could not finish sign-up." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h2>Almost there</h2>
      <p className="muted">Your Google account is new here. Tell us how you&apos;ll use JobMarketPlace.</p>

      {error && (
        <AlertBanner type="error" title={error.code ? String(error.code).replace(/_/g, " ") : "Error"}>
          {error.message}
        </AlertBanner>
      )}

      <form onSubmit={submit} className="card form">
        <fieldset className="role-fieldset">
          <legend className="muted">I am…</legend>
          <label className="role-option">
            <input
              type="radio"
              name="role"
              checked={accountType === "jobseeker"}
              onChange={() => setAccountType("jobseeker")}
            />
            <span>Looking for a job (job seeker)</span>
          </label>
          <label className="role-option">
            <input
              type="radio"
              name="role"
              checked={accountType === "employer"}
              onChange={() => setAccountType("employer")}
            />
            <span>Hiring / employer</span>
          </label>
        </fieldset>

        {accountType === "employer" && (
          <input
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </main>
  );
};

export default OauthGoogleRolePage;
