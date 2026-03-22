import { useEffect, useState } from "react";
import api from "../../api/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [jobseekers, setJobseekers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);

  const load = async () => {
    const [statsRes, jsRes, empRes, jobsRes] = await Promise.all([
      api.get("/admin/dashboard/stats"),
      api.get("/admin/jobseekers"),
      api.get("/admin/employers"),
      api.get("/admin/jobs"),
    ]);
    setStats(statsRes.data);
    setJobseekers(jsRes.data);
    setEmployers(empRes.data);
    setJobs(jobsRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateJobStatus = async (id, status) => {
    await api.patch(`/admin/jobs/${id}/status`, { status });
    load();
  };

  return (
    <main className="container">
      <h2>Admin Dashboard</h2>
      {stats && (
        <section className="grid">
          <article className="card">Job seekers: {stats.totalJobSeekers}</article>
          <article className="card">Employers: {stats.totalEmployers}</article>
          <article className="card">Admins: {stats.totalAdmins}</article>
          <article className="card">Jobs: {stats.totalJobs}</article>
          <article className="card">Bids: {stats.totalBids}</article>
        </section>
      )}

      <h3>Job seekers</h3>
      <div className="grid">
        {jobseekers.map((u) => (
          <article key={u._id} className="card">
            <p>
              {u.name} — {u.email}
            </p>
          </article>
        ))}
      </div>

      <h3>Employers</h3>
      <div className="grid">
        {employers.map((c) => (
          <article key={c._id} className="card">
            <p>
              <strong>{c.companyName}</strong> — {c.email}
            </p>
          </article>
        ))}
      </div>

      <h3>Jobs (moderation)</h3>
      <div className="grid">
        {jobs.map((j) => (
          <article key={j._id} className="card">
            <p>{j.description}</p>
            <p>Status: {j.status}</p>
            <div className="row">
              <button type="button" onClick={() => updateJobStatus(j._id, "open")}>
                Open
              </button>
              <button type="button" onClick={() => updateJobStatus(j._id, "closed")}>
                Close
              </button>
              <button type="button" onClick={() => updateJobStatus(j._id, "rejected")}>
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export default AdminDashboard;
