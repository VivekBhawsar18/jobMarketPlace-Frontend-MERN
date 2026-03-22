import { useEffect, useState } from "react";
import api from "../../api/client";

const EmployerDashboard = () => {
  const [profile, setProfile] = useState({ name: "", companyName: "", description: "", industry: "" });
  const [jobs, setJobs] = useState([]);
  const [bids, setBids] = useState([]);
  const [jobForm, setJobForm] = useState({ description: "", budget: "", duration: "", location: "" });
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

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    await api.put("/company/me", profile);
    setMessage(isEditingProfile ? "Company profile saved successfully!" : "Company profile updated.");
    setIsEditingProfile(false);
  };

  const createJob = async () => {
    await api.post("/company/jobs", { ...jobForm, budget: Number(jobForm.budget) });
    setMessage("Job posted.");
    setJobForm({ description: "", budget: "", duration: "", location: "" });
    load();
  };

  const loadApplicants = async (jobId) => {
    const res = await api.get(`/company/jobs/${jobId}/bids`);
    setBids(res.data);
  };

  const isProfileComplete = profile.companyName && profile.industry;

  if (!isLoaded) return <main className="container"><p>Loading dashboard...</p></main>;

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Employer Dashboard</h2>
        {isProfileComplete && !isEditingProfile && (
          <button onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
        )}
      </div>
      {message && <p className="success">{message}</p>}
      
      {isEditingProfile ? (
        <form className="card form" onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
          <h3>{!isProfileComplete ? "Complete Company Profile" : "Edit Profile"}</h3>
          <input required placeholder="Your name (contact)" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <input required placeholder="Company name" value={profile.companyName || ""} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} />
        <input required placeholder="Description" value={profile.description || ""} onChange={(e) => setProfile({ ...profile, description: e.target.value })} />
        <input required placeholder="Industry" value={profile.industry || ""} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} />
        <button type="submit">{!isProfileComplete ? "Save & Continue" : "Save Profile"}</button>
      </form>
      ) : (
      <>
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
      </>
      )}
    </main>
  );
};

export default EmployerDashboard;
