import { useEffect, useState } from "react";
import api from "../../api/client";

const indiaStatesAndCities = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Noida"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri"]
};

const JobSeekerDashboard = () => {
  const [profile, setProfile] = useState({ firstName: "", lastName: "", skills: [], state: "", city: "", location: "", availability: "" });
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const load = async () => {
    const [profileRes, jobsRes] = await Promise.all([
      api.get("/users/me/profile"),
      api.get("/users/jobs/public"),
    ]);
    
    // Attempt to extract state and city from location if backend doesn't store them separately
    const locationParts = profileRes.data.location ? profileRes.data.location.split(",").map(s => s.trim()) : [];
    const derivedCity = profileRes.data.city || (locationParts.length > 0 ? locationParts[0] : "");
    const derivedState = profileRes.data.state || (locationParts.length > 1 ? locationParts[1] : "");

    const nameParts = profileRes.data.name ? profileRes.data.name.split(" ") : [];
    const derivedFirstName = nameParts[0] || "";
    const derivedLastName = nameParts.slice(1).join(" ") || "";

    const newProfile = {
      ...profileRes.data,
      firstName: derivedFirstName,
      lastName: derivedLastName,
      skills: profileRes.data.skills || [],
      state: derivedState,
      city: derivedCity,
    };

    setProfile(newProfile);
    setJobs(jobsRes.data);
    
    if (!derivedFirstName || !newProfile.state || newProfile.skills.length === 0) {
      setIsEditingProfile(true);
    }
    setIsLoaded(true);
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    const locationString = profile.state && profile.city 
      ? `${profile.city}, ${profile.state}` 
      : (profile.state || profile.city || profile.location || "");
      
    await api.put("/users/me/profile", { 
      ...profile, 
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      location: locationString,
      skills: profile.skills.filter(Boolean) 
    });
    setMessage(!isEditingProfile ? "Profile updated" : "Profile saved successfully!");
    setIsEditingProfile(false);
  };

  const bid = async (jobId) => {
    await api.post(`/users/jobs/${jobId}/bids`, { price: 500, timeRequired: "7 days", message: "I can deliver with quality." });
    setMessage("Bid submitted");
  };

  const isProfileComplete = profile.firstName && profile.state && profile.skills?.length > 0;

  if (!isLoaded) return <main className="container"><p>Loading dashboard...</p></main>;

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Job Seeker Dashboard</h2>
        {isProfileComplete && !isEditingProfile && (
          <button onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
        )}
      </div>
      {message && <p className="success">{message}</p>}
      
      {isEditingProfile ? (
        <form className="card form" onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
          <h3>{!isProfileComplete ? "Welcome! Please Complete Your Profile" : "Edit My Profile"}</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input required value={profile.firstName || ""} placeholder="First Name" onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} style={{ flex: 1, margin: 0 }} />
            <input required value={profile.lastName || ""} placeholder="Last Name" onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} style={{ flex: 1, margin: 0 }} />
          </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <select 
            required
            value={profile.state || ""} 
            onChange={(e) => setProfile({ ...profile, state: e.target.value, city: "" })}
            style={{ flex: 1, margin: 0 }}
          >
            <option value="" disabled>Select State</option>
            {Object.keys(indiaStatesAndCities).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select 
            required
            value={profile.city || ""} 
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            style={{ flex: 1, margin: 0 }}
            disabled={!profile.state}
          >
            <option value="" disabled>Select City</option>
            {profile.state && indiaStatesAndCities[profile.state]?.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <select required value={profile.availability || ""} onChange={(e) => setProfile({ ...profile, availability: e.target.value })}>
          <option value="" disabled>Availability</option>
          <option value="full time">Full Time</option>
          <option value="part time">Part Time</option>
        </select>
        <input
          required
          value={(profile.skills || []).join(",")}
          placeholder="Skills comma separated"
          onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(",").map((s) => s.trim()) })}
        />
        <button type="submit">{!isProfileComplete ? "Save & Continue" : "Save Profile"}</button>
      </form>
      ) : (
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
      )}
    </main>
  );
};

export default JobSeekerDashboard;
