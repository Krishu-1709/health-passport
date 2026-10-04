import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import "./QRScanner.css";

function QRScanner() {
  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");

    scannerRef.current = scanner;

    async function startScanner() {
      try {
        setScanning(true);

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleScan(decodedText);
          },
          () => {
            // Ignore normal scanning failures.
          },
        );
      } catch (error) {
        console.error(error);

        setError(
          "Unable to access the camera. Please allow camera permission.",
        );

        setScanning(false);
      }
    }

    startScanner();

    return () => {
      if (scanner.isScanning) {
        scanner
          .stop()
          .catch((error) => console.error("Scanner stop error:", error));
      }
    };
  }, []);

  function handleScan(decodedText) {
    const prefix = "healthpassport://patient/";

    if (!decodedText.startsWith(prefix)) {
      setError("This is not a Health Passport QR code.");
      return;
    }

    const patientId = decodedText.substring(prefix.length);

    if (!patientId) {
      setError("Invalid Health Passport QR code.");
      return;
    }

    if (scannerRef.current?.isScanning) {
      scannerRef.current
        .stop()
        .catch((error) => console.error(error));
    }

    navigate(`/patient/${patientId}`);
  }

  function handleBack() {
    if (scannerRef.current?.isScanning) {
      scannerRef.current
        .stop()
        .catch((error) => console.error(error));
    }

    navigate("/dashboard");
  }

  return (
    <div className="scanner-page">
      <header className="scanner-header">
        <button
          className="scanner-back"
          onClick={handleBack}
        >
          ← Back
        </button>

        <div className="scanner-header-title">
          <div className="scanner-brand-mark">✚</div>

          <div>
            <p className="scanner-eyebrow">HEALTH PASSPORT</p>
            <h1>Scan Health Passport</h1>
          </div>
        </div>
      </header>

      <main className="scanner-main">
        <div className="scanner-intro">
          <p className="scanner-eyebrow">PATIENT IDENTIFICATION</p>

          <h2>Scan the patient's QR code</h2>

          <p className="scanner-description">
            Point the camera at the patient's Health Passport QR code.
          </p>
        </div>

        <section className="scanner-card">
          <div className="scanner-camera-wrapper">
            <div id="qr-reader" className="scanner-reader" />
          </div>

          {scanning && !error && (
            <div className="scanner-status">
              <span className="scanner-status-dot" />
              Scanning for QR code...
            </div>
          )}

          {error && (
            <div className="scanner-error">
              <span className="scanner-error-icon">!</span>

              <div>
                <strong>Scanner error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}
        </section>

        <div className="scanner-security">
          <span>✓</span>
          <div>
            <strong>Private & secure</strong>
            <p>
              The QR code contains only the patient's unique ID.
              Medical information is never stored in the QR code.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QRScanner;