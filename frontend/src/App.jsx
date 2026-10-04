import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import QRScanner from "./pages/QRScanner";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientRecord from "./pages/PatientRecord";
import { useEffect } from "react";
import { syncPendingOperations } from "./services/sync";
import RegisterPatient from "./pages/RegisterPatient";

function App() {
  useEffect(() => {
  // Try syncing when the app starts.
  if (navigator.onLine) {
    syncPendingOperations();
  }

  // Also sync whenever internet comes back.
  function handleOnline() {
    syncPendingOperations();
  }

  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}, []);
  return (
    <BrowserRouter>
      <Routes>
       
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/patient/:id" element={<PatientRecord />} />
  <Route path="/scan" element={<QRScanner />} />
  <Route path="/register" element={<RegisterPatient />} />
  <Route path="/" element={<Navigate to="/login" replace />} />
</Routes>
     
    </BrowserRouter>
  );
}

export default App;
// doctor@demo.com
//demo123