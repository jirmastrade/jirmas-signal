import "./App.css";
import logo from "./assets/IMG_5520.PNG";

function App() {
  const telegramChannel = "https://t.me/jirmastradezone";
  const telegramSupport = "https://t.me/Jirmas_Trader";

  return (
    <div className="app">
      <main className="login-container">
        {/* Logo */}
        <div className="brand-section">
          <div className="logo-box">
            <img src={logo} alt="Jirmas Signals Logo" className="brand-logo" />
          </div>

          <h1>JIRMAS SIGNALS</h1>
          <p className="brand-subtitle">Professional 1M Trading Signals</p>
        </div>

        {/* Login Card */}
        <section className="login-card">
          <div className="welcome">
            <h2>Welcome Back</h2>
            <p>Sign in to access Jirmas Signals</p>
          </div>

          {/* Google Login */}
          <button className="google-button" type="button">
            <span className="google-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.24Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.75Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.53 13.84A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.84V7.63H3.28A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.06 1.03 4.37l3.25-2.53Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.13c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.24 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.38l3.25 2.53C7.3 7.85 9.46 6.13 12 6.13Z"
                />
              </svg>
            </span>

            <span>Continue with Google</span>
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          {/* Telegram Community */}
          <a
            className="telegram-card"
            href={telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="telegram-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.6 3.2 2.9 10.4c-1.28.51-1.27 1.22-.23 1.54l4.8 1.5 1.84 5.7c.22.61.11.86.74.86.49 0 .7-.22.96-.48l2.32-2.26 4.83 3.57c.89.49 1.53.23 1.75-.82l3.16-14.9c.32-1.27-.48-1.84-1.46-1.41Zm-3.7 3.2-7.95 7.08-.31 3.39-1.47-4.56 9.73-6.13c.43-.27.83-.12.5.22Z"
                />
              </svg>
            </div>

            <div className="telegram-text">
              <span className="small-label">JOIN OUR COMMUNITY</span>
              <strong>Jirmas Trade Zone</strong>
              <span className="action-text">Join Channel →</span>
            </div>
          </a>

          {/* Support */}
          <a
            className="support-card"
            href={telegramSupport}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="telegram-icon support-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.6 3.2 2.9 10.4c-1.28.51-1.27 1.22-.23 1.54l4.8 1.5 1.84 5.7c.22.61.11.86.74.86.49 0 .7-.22.96-.48l2.32-2.26 4.83 3.57c.89.49 1.53.23 1.75-.82l3.16-14.9c.32-1.27-.48-1.84-1.46-1.41Zm-3.7 3.2-7.95 7.08-.31 3.39-1.47-4.56 9.73-6.13c.43-.27.83-.12.5.22Z"
                />
              </svg>
            </div>

            <div className="telegram-text">
              <span className="small-label">NEED SUPPORT?</span>
              <strong>Jirmas Trader</strong>
              <span className="action-text">Contact Support →</span>
            </div>
          </a>

          <div className="security-note">
            🔒 Secure access • Your account information is protected
          </div>
        </section>

        <footer>
          <span>©️ 2026 JIRMAS SIGNALS</span>
          <span>•</span>
          <span>1 MIN SIGNALS</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
