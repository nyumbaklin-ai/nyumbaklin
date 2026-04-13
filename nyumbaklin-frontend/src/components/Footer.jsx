import { Link } from "react-router-dom";

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
    lineHeight: "1.7",
  };

  const buttonStyle = {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: "600",
    textDecoration: "none",
    marginTop: "8px",
    fontSize: "14px",
  };

  const callButton = {
    ...buttonStyle,
    background: "#2563eb",
    color: "white",
    marginRight: "10px",
  };

  const whatsappButton = {
    ...buttonStyle,
    background: "#22c55e",
    color: "white",
  };

  const quickLinkStyle = {
    color: "#cbd5e1",
    textDecoration: "none",
    display: "block",
    marginTop: "8px",
    fontSize: "14px",
  };

  const emailStyle = {
    marginTop: "12px",
    fontSize: "14px",
    color: "#cbd5e1",
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
            <br />
            Book trusted cleaners easily and quickly.
          </p>
        </div>

        <div style={sectionStyle}>
          <p style={titleStyle}>Contact Us</p>

          <a href="tel:+256750749484" style={callButton}>
            📞 Call Us
          </a>

          <a
            href="https://wa.me/256781812743"
            target="_blank"
            rel="noopener noreferrer"
            style={whatsappButton}
          >
            💬 WhatsApp
          </a>

          <p style={emailStyle}>📧 nyumbaklin@gmail.com</p>
        </div>

        <div style={sectionStyle}>
          <p style={titleStyle}>Quick Links</p>

          <Link to="/about-us" style={quickLinkStyle}>
            About Us
          </Link>

          <Link to="/privacy-policy" style={quickLinkStyle}>
            Privacy Policy
          </Link>

          <Link to="/terms-conditions" style={quickLinkStyle}>
            Terms & Conditions
          </Link>
        </div>
      </div>

      <div style={bottomStyle}>
        © 2026 Nyumbaklin. All rights reserved.
      </div>
    </div>
  );
}

export default Footer;