import { useEffect, useState } from "react";
import api from "../../api/client";

const CompanyDashboard = () => {
  const [profile, setProfile] = useState({ name: "", description: "", industry: "" });
  const [jobs, setJobs] = useState([]);
  const [bids, setBids] = useState([]);
  const [jobForm, setJobForm] = useState({ description: "", budget: "", duration: "", location: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const [profileRes, jobsRes] = await Promise.all([api.get("/company/me"), api.get("/company/jobs")]);
    if (profileRes.data) setProfile(profileRes.data);
    setJobs(jobsRes.data);
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    await api.put("/company/me", profile);
    setMessage("Company profile saved");
  };

  const createJob = async () => {
    await api.post("/company/jobs", { ...jobForm, budget: Number(jobForm.budget) });
    setMessage("Job created (pending admin approval)");
    setJobForm({ description: "", budget: "", duration: "", location: "" });
    load();
  };

  const loadApplicants = async (jobId) => {
    const res = await api.get(`/company/jobs/${jobId}/bids`);
    setBids(res.data);
  };

  return (
    <main className="container">
      <h2>Company Dashboard</h2>
      {message && <p className="success">{message}</p>}
      <section className="card form">
        <h3>Company Profile</h3>
        <input placeholder="Company name" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <input placeholder="Description" value={profile.description || ""} onChange={(e) => setProfile({ ...profile, description: e.target.value })} />
        <input placeholder="Industry" value={profile.industry || ""} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} />
        <button onClick={saveProfile}>Save profile</button>
      </section>

      <section className="card form">
        <h3>Post Job</h3>
        <input placeholder="Description" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
        <input placeholder="Budget" type="number" value={jobForm.budget} onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })} />
        <input placeholder="Duration" value={jobForm.duration} onChange={(e) => setJobForm({ ...jobForm, duration: e.target.value })} />
        <input placeholder="Location" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
        <button onClick={createJob}>Create Job</button>
      </section>

      <section>
        <h3>My Jobs</h3>
        <div className="grid">
          {jobs.map((job) => (
            <article key={job._id} className="card">
              <p>{job.description}</p>
              <p>Status: {job.status}</p>
              <button onClick={() => loadApplicants(job._id)}>View Applicants</button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Applicants (No contact details)</h3>
        <div className="grid">
          {bids.map((bid) => (
            <article className="card" key={bid.bidId}>
              <p>User: {bid.user?.name}</p>
              <p>Skills: {(bid.user?.skills || []).join(", ")}</p>
              <p>Bid: {bid.bidPrice}</p>
              <p>Time: {bid.deliveryTime}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default CompanyDashboard;
