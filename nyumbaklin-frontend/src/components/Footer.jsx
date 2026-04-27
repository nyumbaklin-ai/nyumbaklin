import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="nyumba-footer">
      <style>
        {`
          .nyumba-footer {
            background: linear-gradient(135deg, #07111f 0%, #0f172a 55%, #111827 100%);
            color: #cbd5e1;
            padding: 42px 20px 22px;
            margin-top: 40px;
            border-top: 1px solid rgba(148, 163, 184, 0.18);
          }

          .nyumba-footer-container {
            max-width: 1120px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1.2fr 1fr 1fr;
            gap: 34px;
            align-items: start;
          }

          .nyumba-footer-brand {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .nyumba-footer-title {
            color: #ffffff;
            font-size: 20px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 0.2px;
          }

          .nyumba-footer-text {
            font-size: 14px;
            line-height: 1.8;
            margin: 0;
            color: #cbd5e1;
            max-width: 320px;
          }

          .nyumba-footer-small-note {
            margin: 8px 0 0 0;
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.6;
          }

          .nyumba-footer-heading {
            color: #ffffff;
            font-size: 16px;
            font-weight: 800;
            margin: 0 0 14px 0;
          }

          .nyumba-footer-contact-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 14px;
          }

          .nyumba-footer-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 10px 14px;
            border-radius: 999px;
            font-weight: 800;
            text-decoration: none;
            font-size: 14px;
            transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
            min-height: 40px;
          }

          .nyumba-footer-button:hover {
            transform: translateY(-1px);
            opacity: 0.95;
          }

          .nyumba-footer-call {
            background: #2563eb;
            color: #ffffff;
            box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);
          }

          .nyumba-footer-whatsapp {
            background: #16a34a;
            color: #ffffff;
            box-shadow: 0 10px 20px rgba(22, 163, 74, 0.22);
          }

          .nyumba-footer-email {
            color: #cbd5e1;
            text-decoration: none;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            word-break: break-word;
          }

          .nyumba-footer-email:hover {
            color: #ffffff;
          }

          .nyumba-footer-links {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .nyumba-footer-link {
            color: #cbd5e1;
            text-decoration: none;
            font-size: 14px;
            width: fit-content;
            transition: color 0.18s ease, transform 0.18s ease;
          }

          .nyumba-footer-link:hover {
            color: #ffffff;
            transform: translateX(3px);
          }

          .nyumba-footer-bottom {
            max-width: 1120px;
            margin: 30px auto 0;
            padding-top: 18px;
            border-top: 1px solid rgba(148, 163, 184, 0.18);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            color: #94a3b8;
            font-size: 13px;
          }

          .nyumba-footer-status {
            display: inline-flex;
            align-items: center;
            gap: 7px;
          }

          .nyumba-footer-dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 999px;
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
          }

          @media (max-width: 768px) {
            .nyumba-footer {
              padding: 34px 18px 20px;
              margin-top: 30px;
            }

            .nyumba-footer-container {
              grid-template-columns: 1fr;
              gap: 28px;
              text-align: center;
            }

            .nyumba-footer-brand {
              align-items: center;
            }

            .nyumba-footer-text {
              max-width: 100%;
            }

            .nyumba-footer-contact-buttons {
              justify-content: center;
            }

            .nyumba-footer-email {
              justify-content: center;
              width: 100%;
            }

            .nyumba-footer-links {
              align-items: center;
            }

            .nyumba-footer-link:hover {
              transform: none;
            }

            .nyumba-footer-bottom {
              justify-content: center;
              text-align: center;
              margin-top: 26px;
            }
          }

          @media (max-width: 420px) {
            .nyumba-footer-contact-buttons {
              flex-direction: column;
              width: 100%;
            }

            .nyumba-footer-button {
              width: 100%;
              box-sizing: border-box;
            }
          }
        `}
      </style>

      <div className="nyumba-footer-container">
        <div className="nyumba-footer-brand">
          <p className="nyumba-footer-title">Nyumbaklin</p>

          <p className="nyumba-footer-text">
            Professional cleaning services in Kampala. Book trusted cleaners
            easily, quickly, and safely.
          </p>

          <p className="nyumba-footer-small-note">
            Home cleaning, deep cleaning, office cleaning, and trusted cleaner
            support.
          </p>
        </div>

        <div>
          <p className="nyumba-footer-heading">Contact Us</p>

          <div className="nyumba-footer-contact-buttons">
            <a
              href="tel:+256781812743"
              className="nyumba-footer-button nyumba-footer-call"
            >
              📞 Call Us
            </a>

            <a
              href="https://wa.me/256750749484"
              target="_blank"
              rel="noopener noreferrer"
              className="nyumba-footer-button nyumba-footer-whatsapp"
            >
              💬 WhatsApp
            </a>
          </div>

          <a href="mailto:nyumbaklin@gmail.com" className="nyumba-footer-email">
            📧 nyumbaklin@gmail.com
          </a>
        </div>

        <div>
          <p className="nyumba-footer-heading">Quick Links</p>

          <div className="nyumba-footer-links">
            <Link to="/about-us" className="nyumba-footer-link">
              About Us
            </Link>

            <Link to="/privacy-policy" className="nyumba-footer-link">
              Privacy Policy
            </Link>

            <Link to="/terms-conditions" className="nyumba-footer-link">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>

      <div className="nyumba-footer-bottom">
        <span>© 2026 Nyumbaklin. All rights reserved.</span>

        <span className="nyumba-footer-status">
          <span className="nyumba-footer-dot"></span>
          Serving Kampala, Uganda
        </span>
      </div>
    </footer>
  );
}

export default Footer;