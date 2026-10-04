import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RegisterPatient.css";

function RegisterPatient() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    sex: "",
    phone: "",
    village: "",
    blood_group: "",
    allergies: "",
    medications: "",
    chronic_conditions: "",
    emergency_contact: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/patients", {
  ...form,
  age: Number(form.age),
  allergies: form.allergies
    ? form.allergies.split(",").map((item) => item.trim())
    : [],
  medications: form.medications
    ? form.medications.split(",").map((item) => item.trim())
    : [],
});

      alert("Patient registered successfully!");

      navigate(`/patient/${response.data.id}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to register patient."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <h1>Register Patient</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Patient Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          required
        />

        <select
  name="sex"
  value={form.sex}
  onChange={handleChange}
  required
>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <input
  name="village"
  placeholder="Village"
  value={form.village}
  onChange={handleChange}
/>

        <input
          name="blood_group"
          placeholder="Blood Group"
          value={form.blood_group}
          onChange={handleChange}
        />

        <input
          name="allergies"
          placeholder="Allergies"
          value={form.allergies}
          onChange={handleChange}
        />

        <input
  name="medications"
  placeholder="Medications"
  value={form.medications}
  onChange={handleChange}
/>

        <input
          name="chronic_conditions"
          placeholder="Chronic Conditions"
          value={form.chronic_conditions}
          onChange={handleChange}
        />
        <input
  name="emergency_contact"
  placeholder="Emergency Contact"
  value={form.emergency_contact}
  onChange={handleChange}
/>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Patient"}
        </button>
      </form>

      <button onClick={() => navigate("/dashboard")}>
        Cancel
      </button>
    </div>
  );
}

export default RegisterPatient;