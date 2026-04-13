function Footer() {
  const footerStyle = {
    background: "#0f172a",
    color: "#cbd5e1",
    padding: "30px 20px",
    marginTop: "40px",
  };

  const containerStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "20px",
  };

  const sectionStyle = {
    flex: "1 1 250px",
  };

  const titleStyle = {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
  };

  const textStyle = {
    fontSize: "14px",
    lineHeight: "1.6",
  };

  const bottomStyle = {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#94a3b8",
  };

  return (
    <div style={footerStyle}>
      <div style={containerStyle}>
        
        <div style={sectionStyle}>
          <p style={titleStyle}>Nyumbaklin</p>
          <p style={textStyle}>
            Professional cleaning services in Kampala.  
            Book trusted cleaners easily and quickly.
          </p>
        </div>

        <div style={sectionStyle}>
          <p style={titleStyle}>Contact Us</p>
          <p style={textStyle}>
            📞 +256 XXX XXX XXX <br />
            📧 nyumbaklin@gmail.com
          </p>
        </div>

        <div style={sectionStyle}>
          <p style={titleStyle}>Quick Links</p>
          <p style={textStyle}>
            About Us <br />
            Privacy Policy <br />
            Terms & Conditions
          </p>
        </div>

      </div>

      <div style={bottomStyle}>
        © 2026 Nyumbaklin. All rights reserved.
      </div>
    </div>
  );
}

export default Footer;