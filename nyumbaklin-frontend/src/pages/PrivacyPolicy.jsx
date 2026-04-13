function PrivacyPolicy() {
  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    padding: "40px 20px",
  };

  const containerStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
  };

  const heroStyle = {
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    color: "white",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.15)",
    marginBottom: "28px",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
    marginBottom: "22px",
  };

  const titleStyle = {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
  };

  const sectionTitleStyle = {
    marginTop: 0,
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "700",
  };

  const textStyle = {
    color: "#475569",
    fontSize: "16px",
    lineHeight: "1.8",
    marginBottom: "12px",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={heroStyle}>
          <h1 style={titleStyle}>Privacy Policy</h1>
          <p style={{ marginTop: "12px", fontSize: "16px", lineHeight: "1.7", opacity: 0.95 }}>
            Your privacy matters to us. This page explains how Nyumbaklin collects,
            uses, and protects your information.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Information We Collect</h2>
          <p style={textStyle}>
            Nyumbaklin may collect information such as your name, phone number,
            email address, booking details, and service-related information when
            you use our platform.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>How We Use Your Information</h2>
          <p style={textStyle}>
            We use your information to manage bookings, connect customers with
            cleaners, improve service delivery, communicate important updates,
            and support the smooth running of the platform.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Data Protection</h2>
          <p style={textStyle}>
            We take reasonable steps to protect your information and keep your
            data secure. We do not sell your personal information to third parties.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Contact</h2>
          <p style={textStyle}>
            If you have any privacy-related questions, you can contact Nyumbaklin
            through our official phone number, WhatsApp, or email listed in the footer.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;