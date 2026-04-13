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

  const buttonStyle = {
    display: "block",
    width: "fit-content",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: "600",
    textDecoration: "none",
    marginTop: "8px",
  };

  const callButton = {
    ...buttonStyle,
    background: "#2563eb",
    color: "white",
  };

  const whatsappButton = {
    ...buttonStyle,
    background: "#22c55e",
    color: "white",
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

          {/* CALL BUTTON */}
          <a href="tel:+256750749484" style={callButton}>
            📞 Call Us
          </a>

          {/* WHATSAPP BUTTON */}
          <a
            href="https://wa.me/256781812743"
            target="_blank"
            rel="noopener noreferrer"
            style={whatsappButton}
          >
            💬 WhatsApp Chat
          </a>

          {/* EMAIL */}
          <p style={{ marginTop: "10px", fontSize: "14px" }}>
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