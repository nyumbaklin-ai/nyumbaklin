function AboutUs() {
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

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginTop: "18px",
  };

  const smallCardStyle = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={heroStyle}>
          <h1 style={titleStyle}>About Nyumbaklin</h1>
          <p style={{ marginTop: "12px", fontSize: "16px", lineHeight: "1.7", opacity: 0.95 }}>
            Nyumbaklin is a cleaning service platform that connects customers with trusted cleaners
            in Kampala quickly, safely, and professionally.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Who We Are</h2>
          <p style={textStyle}>
            Nyumbaklin is built to make booking cleaning services easier for homes and businesses.
            We help customers find reliable cleaners, manage bookings smoothly, and improve trust
            through a professional service process.
          </p>
          <p style={textStyle}>
            Our goal is to make cleaning services more accessible, organized, and convenient in Uganda,
            starting with Kampala.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>What We Do</h2>
          <div style={gridStyle}>
            <div style={smallCardStyle}>
              <h3 style={{ marginTop: 0, color: "#1d4ed8" }}>Home Cleaning</h3>
              <p style={textStyle}>
                Easy booking for house cleaning services with clear pricing and trusted cleaners.
              </p>
            </div>

            <div style={smallCardStyle}>
              <h3 style={{ marginTop: 0, color: "#1d4ed8" }}>Deep Cleaning</h3>
              <p style={textStyle}>
                Professional deep cleaning services for customers who need more detailed cleaning support.
              </p>
            </div>

            <div style={smallCardStyle}>
              <h3 style={{ marginTop: 0, color: "#1d4ed8" }}>Office Cleaning</h3>
              <p style={textStyle}>
                Convenient office cleaning solutions for businesses that want a clean working environment.
              </p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Our Mission</h2>
          <p style={textStyle}>
            To build a trusted cleaning platform that helps customers access quality services
            and helps cleaners access real earning opportunities through technology.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;