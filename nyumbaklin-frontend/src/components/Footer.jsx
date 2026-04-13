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
    lineHeight: "1.8",
  };

  const linkStyle = {
    color: "#22c55e",
    textDecoration: "none",
    display: "block",
    marginTop: "5px",
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
            
            {/* CALL */}
            <a href="tel:+256750749484" style={linkStyle}>
              📞 Call: 0750 749 484
            </a>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/256781812743"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              💬 WhatsApp: 0781 812 743
            </a>

            {/* EMAIL */}
            <span style={{ display: "block", marginTop: "5px" }}>
              📧 nyumbaklin@gmail.com
            </span>

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