import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/client";

const EmployerDashboard = () => {
  const [params] = useSearchParams();
  const [profile, setProfile] = useState({ name: "", companyName: "", description: "", industry: "" });
  const [jobs, setJobs] = useState([]);
  const [bids, setBids] = useState([]);
  const [jobForm, setJobForm] = useState({ title: "", description: "", budget: "", duration: "", location: "" });
  const [message, setMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const load = async () => {
    const [profileRes, jobsRes] = await Promise.all([api.get("/company/me"), api.get("/company/jobs")]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      if (!profileRes.data.companyName || !profileRes.data.industry) {
        setIsEditingProfile(true);
      }
    } else {
      setIsEditingProfile(true);
    }
    setJobs(jobsRes.data);
    setIsLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const action = params.get("action");
    if (action === "edit-profile") {
      setIsEditingProfile(true);
    } else {
      setIsEditingProfile(false);
    }
  }, [params]);

  const saveProfile = async () => {
    await api.put("/company/me", profile);
    setMessage(isEditingProfile ? "Company profile saved successfully!" : "Company profile updated.");
    setIsEditingProfile(false);
  };

  const createJob = async () => {
    await api.post("/company/jobs", { ...jobForm, budget: Number(jobForm.budget) });
    setMessage("Job posted.");
    setJobForm({ title: "", description: "", budget: "", duration: "", location: "" });
    load();
  };

  const loadApplicants = async (jobId) => {
    const res = await api.get(`/company/jobs/${jobId}/bids`);
    setBids(res.data);
  };

  const isProfileComplete = profile.companyName && profile.industry;

  if (!isLoaded) return <main className="container"><p>Loading dashboard...</p></main>;

  return (
    <main className="container" style={{ marginTop: '2rem' }}>

      {message && (
        <div style={{ marginBottom: "1.5rem" }}>
          <AlertBanner type="success">{message}</AlertBanner>
        </div>
      )}
      
      {isEditingProfile ? (
        <form className="card form" style={{ maxWidth: '600px', margin: '0 auto' }} onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{!isProfileComplete ? "Complete Company Profile" : "Edit Profile"}</h3>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Contact Name</label>
            <input required placeholder="Your name" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Company Name</label>
            <input required placeholder="Company name" value={profile.companyName || ""} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
            <textarea required placeholder="Company description" rows={4} value={profile.description || ""} onChange={(e) => setProfile({ ...profile, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Industry</label>
            <input required placeholder="e.g. Technology" value={profile.industry || ""} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} />
          </div>
          <button type="submit" className="nav-btn nav-btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {!isProfileComplete ? "Save & Continue" : "Save Profile"}
          </button>
        </form>
      ) : (
      <>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Active Jobs:</h4>
            <div className="value">{jobs.length}</div>
          </div>
          <div className="stat-card">
            <h4>Total Applicants:</h4>
            <div className="value">{jobs.reduce((acc, j) => acc + (j.bidsCount || 0), 0)}</div>
          </div>
          <div className="stat-card">
            <h4>Offers Sent:</h4>
            <div className="value">3</div>
          </div>
        </div>

        <div className="dashboard-layout">
          <div className="main-content">
            <section style={{ marginBottom: '3rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>My Jobs</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th><div className="th-content">Job Title <span className="sort-icon">↕</span></div></th>
                      <th><div className="th-content">Applicants <span className="sort-icon">↕</span></div></th>
                      <th><div className="th-content">Status <span className="sort-icon">↕</span></div></th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No jobs posted yet</td></tr>
                    ) : jobs.map((job) => (
                      <tr key={job._id}>
                        <td style={{ fontWeight: 500 }}>{job.description.split('\n')[0].slice(0, 40)}...</td>
                        <td>{job.bidsCount || 0}</td>
                        <td>
                          <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
                            {job.status === 'open' ? 'Running' : 'Warning'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="icon-btn" title="Edit Job">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button className="icon-btn" title="Delete Job">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                            <button className="icon-btn" title="More Options">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 style={{ marginBottom: '1.5rem' }}>Applicants (No contact details)</h3>
              <div className="applicant-grid">
                {bids.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Select a job to view applicants</p>
                ) : bids.map((bid) => (
                  <article className="applicant-card" key={bid.bidId}>
                    <div className="avatar">
                      {bid.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="applicant-info">
                      <h4>{bid.user?.name || "Anonymous User"}</h4>
                      <p><strong>Key info:</strong> (No contact details)</p>
                      <p style={{ marginTop: '0.5rem' }}>
                        <strong>Bid:</strong> ${bid.bidPrice} | <strong>Time:</strong> {bid.deliveryTime}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="sidebar-card">
            <h3>Post Job</h3>
            <div className="form-group">
              <label>Job Title</label>
              <input placeholder="Job Title" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Job Description (Rich Text Area with basic formatting toolbar)</label>
              <textarea placeholder="Job Description" rows={6} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Budget ($ USD)</label>
              <input placeholder="Budget" type="number" value={jobForm.budget} onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input placeholder="Duration" value={jobForm.duration} onChange={(e) => setJobForm({ ...jobForm, duration: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input placeholder="Location" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
            </div>
            <button className="nav-btn nav-btn-primary" style={{ width: '100%' }} onClick={createJob}>Create Job</button>
          </aside>
        </div>
      </>
      )}
    </main>
  );
};

export default EmployerDashboard;
