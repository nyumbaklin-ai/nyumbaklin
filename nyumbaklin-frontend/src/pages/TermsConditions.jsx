function TermsConditions() {
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
          <h1 style={titleStyle}>Terms & Conditions</h1>
          <p style={{ marginTop: "12px", fontSize: "16px", lineHeight: "1.7", opacity: 0.95 }}>
            These terms explain how Nyumbaklin services should be used by customers,
            cleaners, and other users of the platform.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Use of the Platform</h2>
          <p style={textStyle}>
            By using Nyumbaklin, you agree to use the platform responsibly and provide
            accurate information when booking services or creating an account.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Bookings and Services</h2>
          <p style={textStyle}>
            Nyumbaklin connects customers with cleaners for cleaning-related services.
            Availability, pricing, and service completion may depend on location,
            cleaner availability, and platform policies.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Payments</h2>
          <p style={textStyle}>
            Payments may be made according to the options available on the platform.
            Customers are expected to follow the correct payment process and avoid
            fraudulent activity or misuse of the system.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Account Responsibility</h2>
          <p style={textStyle}>
            Users are responsible for keeping their account details secure. Nyumbaklin
            is not responsible for losses caused by sharing passwords or account misuse
            by unauthorized persons.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Changes to Terms</h2>
          <p style={textStyle}>
            Nyumbaklin may update these terms when necessary to improve service delivery
            and platform management. Continued use of the platform means acceptance of
            the updated terms.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsConditions;