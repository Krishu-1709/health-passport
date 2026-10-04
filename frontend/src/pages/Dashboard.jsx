import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = localStorage.getItem("user_name");
  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients");

      setPatients(response.data);
    } catch (error) {
      console.error(error);
      setError("Unable to load patients.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");

    navigate("/login");
  }

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(search.toLowerCase()),
  );

 return (
  <div className="dashboard-page">
    <header className="dashboard-header">
      <div className="dashboard-brand">
        <div className="dashboard-brand-mark">+</div>
        <div>
          <h1>Health Passport</h1>
          <p>Rural Healthcare Network</p>
        </div>
      </div>

      <div className="dashboard-header-right">
        <div className="dashboard-user">
          <div className="dashboard-user-avatar">
            {userName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <strong>{userName}</strong>
            <span>{userRole}</span>
          </div>
        </div>

        <div className="dashboard-status">
          <span className={navigator.onLine ? "status-dot online" : "status-dot offline"} />
          {navigator.onLine ? "Online" : "Offline"}
        </div>

        <button className="dashboard-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>

    <main className="dashboard-main">
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">Healthcare workspace</p>
          <h2>Good to see you, {userName?.split(" ")[0]}.</h2>
          <p>
            Manage patient records, access health information, and continue
            care even when connectivity is limited.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="dashboard-action primary"
            onClick={() => navigate("/register")}
          >
            <span className="action-icon">+</span>
            Register Patient
          </button>

          <button
            className="dashboard-action secondary"
            onClick={() => navigate("/scan")}
          >
            <span className="action-icon">⌁</span>
            Scan Patient QR
          </button>
        </div>
      </section>

      <section className="dashboard-stats">
        <div className="dashboard-stat">
          <span className="stat-label">Total Patients</span>
          <strong>{patients.length}</strong>
          <span className="stat-description">Registered records</span>
        </div>

        <div className="dashboard-stat">
          <span className="stat-label">Connectivity</span>
          <strong>{navigator.onLine ? "Online" : "Offline"}</strong>
          <span className="stat-description">
            {navigator.onLine
              ? "Records can sync"
              : "Using local records"}
          </span>
        </div>

        <div className="dashboard-stat">
          <span className="stat-label">Access</span>
          <strong>Secure</strong>
          <span className="stat-description">Authenticated session</span>
        </div>
      </section>

      <section className="dashboard-patients">
        <div className="patients-heading">
          <div>
            <p className="dashboard-eyebrow">Patient records</p>
            <h2>Patients</h2>
          </div>

          <span className="patient-count">
            {filteredPatients.length} records
          </span>
        </div>

        <div className="patient-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search patients by name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading && (
          <div className="dashboard-message">
            Loading patient records...
          </div>
        )}

        {error && (
          <div className="dashboard-message error">
            {error}
          </div>
        )}

        {!loading && !error && filteredPatients.length === 0 && (
          <div className="dashboard-message">
            No patients found.
          </div>
        )}

        {!loading && !error && filteredPatients.length > 0 && (
          <div className="patient-list">
            {filteredPatients.map((patient) => (
              <button
                className="patient-row"
                key={patient.id}
                onClick={() => navigate(`/patient/${patient.id}`)}
              >
                <div className="patient-avatar">
                  {patient.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="patient-main">
                  <strong>{patient.name}</strong>
                  <span>
                    {patient.village || "Location unavailable"}
                  </span>
                </div>

                <div className="patient-meta">
                  <span>Age</span>
                  <strong>{patient.age}</strong>
                </div>

                <span className="patient-arrow">›</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  </div>
);
}

export default Dashboard;