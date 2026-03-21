import { useEffect, useState } from "react";
import api from "../../api/client";

const UserDashboard = () => {
  const [profile, setProfile] = useState({ name: "", skills: [], location: "", availability: "" });
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [profileRes, jobsRes] = await Promise.all([
      api.get("/users/me/profile"),
      api.get("/users/jobs/public"),
    ]);
    setProfile({
      ...profileRes.data,
      skills: profileRes.data.skills || [],
    });
    setJobs(jobsRes.data);
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    await api.put("/users/me/profile", { ...profile, skills: profile.skills.filter(Boolean) });
    setMessage("Profile updated");
  };

  const bid = async (jobId) => {
    await api.post(`/users/jobs/${jobId}/bids`, { price: 500, timeRequired: "7 days", message: "I can deliver with quality." });
    setMessage("Bid submitted");
  };

  return (
    <main className="container">
      <h2>User Dashboard</h2>
      {message && <p className="success">{message}</p>}
      <section className="card form">
        <h3>My Profile</h3>
        <input value={profile.name || ""} placeholder="Name" onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <input value={profile.location || ""} placeholder="Location" onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
        <input value={profile.availability || ""} placeholder="Availability" onChange={(e) => setProfile({ ...profile, availability: e.target.value })} />
        <input
          value={(profile.skills || []).join(",")}
          placeholder="Skills comma separated"
          onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(",").map((s) => s.trim()) })}
        />
        <button onClick={saveProfile}>Save profile</button>
      </section>

      <section>
        <h3>Available Jobs (Company hidden)</h3>
        <div className="grid">
          {jobs.map((job) => (
            <article key={job.id} className="card">
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Budget:</strong> {job.budget}</p>
              <p><strong>Duration:</strong> {job.duration}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <button onClick={() => bid(job.id)}>Apply/Bid</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default UserDashboard;
