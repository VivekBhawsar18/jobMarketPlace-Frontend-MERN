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

  const toggleJS = async (id) => {
    await api.patch(`/admin/jobseekers/${id}/toggle-active`);
    load();
  };

  const toggleEmp = async (id) => {
    await api.patch(`/admin/employers/${id}/toggle-active`);
    load();
  };

  const showDetail = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  return (
    <main className="container" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.85rem' }}>Admin Dashboard</h2>
      
      {stats && (
        <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <div className="value">{stats.totalJobSeekers}</div>
              <h4>Job seekers:</h4>
            </div>
            <div className="admin-stat-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <div className="value">{stats.totalEmployers}</div>
              <h4>Employers:</h4>
            </div>
            <div className="admin-stat-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><line x1="15" y1="22" x2="15" y2="2"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="10" x2="20" y2="10"></line><line x1="4" y1="14" x2="20" y2="14"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <div className="value">{stats.totalAdmins}</div>
              <h4>Admins:</h4>
            </div>
            <div className="admin-stat-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"></path></svg>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <div className="value">{stats.totalJobs}</div>
              <h4>Jobs:</h4>
            </div>
            <div className="admin-stat-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5h2M11 9h2M11 13h2M11 17h2M7 5H5v14h2M19 5h-2v14h2"></path></svg>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <div className="value">{stats.totalBids}</div>
              <h4>Bids:</h4>
            </div>
            <div className="admin-stat-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 12.5l4.5 4.5V21h-4l-4.5-4.5M10.5 8.5L6 4H2v4l4.5 4.5M17 2v4l-4.5 4.5M2 21l4.5-4.5"></path></svg>
            </div>
          </div>
        </section>
      )}

      <section style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0 }}>Job seekers</h3>
          <button className="admin-btn-outline"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg> Filter</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th><div className="th-content">ID <span className="sort-icon">↕</span></div></th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobseekers.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>No job seekers registered</td></tr>
              ) : jobseekers.map((u) => (
                <tr key={u._id}>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{u._id.slice(-4)}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.isActive === false ? 'badge-warning' : 'badge-success'}`}>{u.isActive === false ? 'Suspended' : 'Active'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="admin-btn" onClick={() => alert("Edit JS " + u._id)}>Edit</button>
                      <button className="admin-btn" style={{ background: u.isActive === false ? '#10b981' : '#f43f5e' }} onClick={() => toggleJS(u._id)}>
                        {u.isActive === false ? 'Reactivate' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1.25rem' }}>Employers</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th><div className="th-content">Company ID <span className="sort-icon">↕</span></div></th>
                <th>Company Name</th>
                <th>Primary Contact</th>
                <th>Contact Email</th>
                <th>Subscription Tier</th>
                <th>Verification Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employers.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>No employers registered</td></tr>
              ) : employers.map((c) => (
                <tr key={c._id}>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{c._id.slice(-4)}</td>
                  <td style={{ fontWeight: 600 }}>{c.companyName}</td>
                  <td>{c.name || "N/A"}</td>
                  <td>{c.email}</td>
                  <td><span style={{ fontWeight: 500 }}>Standard</span></td>
                  <td><span className={`badge ${c.isActive === false ? 'badge-warning' : (c.isVerified ? 'badge-success' : 'badge-info')}`}>
                    {c.isActive === false ? 'Suspended' : (c.isVerified ? 'Verified' : 'Unchecked')}
                  </span></td>
                  <td>
                    <div className="action-btns">
                      <button className="admin-btn" onClick={() => alert("Edit Employer " + c._id)}>Edit</button>
                      <button className="admin-btn" style={{ background: c.isActive === false ? '#10b981' : '#475569' }} onClick={() => toggleEmp(c._id)}>
                        {c.isActive === false ? 'Reactivate' : 'Suspend'}
                      </button>
                      <button className="admin-btn" style={{ background: '#1e293b' }} onClick={() => showDetail(c)}>Detail View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '3rem', marginBottom: '4rem' }}>
        <h3 style={{ marginBottom: '1.25rem' }}>Jobs (moderation)</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th><div className="th-content">Job ID <span className="sort-icon">↕</span></div></th>
                <th>Job Title</th>
                <th>Posted By (Employer)</th>
                <th>Moderation Status</th>
                <th><div className="th-content">Posted Date <span className="sort-icon">↕</span></div></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>No jobs to moderate</td></tr>
              ) : jobs.map((j) => (
                <tr key={j._id}>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{j._id.slice(-4)}</td>
                  <td style={{ fontWeight: 600 }}>{j.title || "Job Title"}</td>
                  <td>{j.postedBy || "Employer"}</td>
                  <td>
                    <span className={`badge ${j.status === 'open' ? 'badge-success' : 'badge-info'}`}>
                      {j.status === 'open' ? 'Approved' : (j.status === 'rejected' ? 'Rejected' : 'Pending')}
                    </span>
                  </td>
                  <td>10/12/2023</td>
                  <td>
                    <div className="action-btns">
                      <button className="admin-btn" style={{ background: '#10b981' }} onClick={() => updateJobStatus(j._id, "open")}>Approve</button>
                      <button className="admin-btn" style={{ background: '#f43f5e' }} onClick={() => updateJobStatus(j._id, "rejected")}>Reject</button>
                      <button className="admin-btn" style={{ background: '#f59e0b' }} onClick={() => alert("Flag job " + j._id)}>Flag</button>
                      <button className="admin-btn" style={{ background: '#1e293b' }} onClick={() => showDetail(j)}>Detail View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
