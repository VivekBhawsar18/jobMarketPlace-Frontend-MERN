import { useEffect, useState } from "react";
import api from "../../api/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);

  const load = async () => {
    const [statsRes, usersRes, companiesRes, jobsRes] = await Promise.all([
      api.get("/admin/dashboard/stats"),
      api.get("/admin/users"),
      api.get("/admin/companies"),
      api.get("/admin/jobs"),
    ]);
    setStats(statsRes.data);
    setUsers(usersRes.data);
    setCompanies(companiesRes.data);
    setJobs(jobsRes.data);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (path, id, status) => {
    await api.patch(`/admin/${path}/${id}/status`, { status });
    load();
  };

  return (
    <main className="container">
      <h2>Admin Dashboard</h2>
      {stats && (
        <section className="grid">
          <article className="card">Users: {stats.totalUsers}</article>
          <article className="card">Companies: {stats.totalCompanies}</article>
          <article className="card">Jobs: {stats.totalJobs}</article>
          <article className="card">Bids: {stats.totalBids}</article>
        </section>
      )}

      <h3>Users</h3>
      <div className="grid">
        {users.map((u) => (
          <article key={u._id} className="card">
            <p>{u.name} ({u.role}) - {u.status}</p>
            {u.role !== "admin" && (
              <div className="row">
                <button onClick={() => updateStatus("users", u._id, "approved")}>Approve</button>
                <button onClick={() => updateStatus("users", u._id, "rejected")}>Reject</button>
              </div>
            )}
          </article>
        ))}
      </div>

      <h3>Companies</h3>
      <div className="grid">
        {companies.map((c) => (
          <article key={c._id} className="card">
            <p>{c.name} - {c.status}</p>
            <div className="row">
              <button onClick={() => updateStatus("companies", c._id, "approved")}>Approve</button>
              <button onClick={() => updateStatus("companies", c._id, "rejected")}>Reject</button>
            </div>
          </article>
        ))}
      </div>

      <h3>Jobs</h3>
      <div className="grid">
        {jobs.map((j) => (
          <article key={j._id} className="card">
            <p>{j.description}</p>
            <p>Status: {j.status}</p>
            <div className="row">
              <button onClick={() => updateStatus("jobs", j._id, "open")}>Approve/Open</button>
              <button onClick={() => updateStatus("jobs", j._id, "rejected")}>Reject</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export default AdminDashboard;
