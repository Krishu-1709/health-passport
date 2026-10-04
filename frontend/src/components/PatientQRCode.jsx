import { useEffect, useState } from "react";
import QRCode from "qrcode";

function PatientQRCode({ patientId }) {
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function generateQRCode() {
      try {
        const qrData = `healthpassport://patient/${patientId}`;

        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: "M",
        });

        setQrCode(dataUrl);
      } catch (error) {
        console.error(error);
        setError("Unable to generate QR code.");
      }
    }

    generateQRCode();
  }, [patientId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!qrCode) {
    return <p>Generating QR code...</p>;
  }

  return (
    <div className="qr-code">
      <img
        src={qrCode}
        alt="Patient health passport QR code"
        width="300"
        height="300"
      />

      <p>
        <strong>QR contains patient ID only</strong>
      </p>
    </div>
  );
}

export default PatientQRCode;