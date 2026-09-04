import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabaseClient";
import logo from "./assets/IMG_5520.PNG";

const SUPPORT_URL = "https://t.me/Jirmas_Trader";
const COMMUNITY_URL = "https://t.me/jirmastradezone";

const MARKETS = {
  Forex: [
    { label: "EUR/USD", symbol: "EUR/USD", tv: "FX:EURUSD" },
    { label: "GBP/USD", symbol: "GBP/USD", tv: "FX:GBPUSD" },
    { label: "USD/JPY", symbol: "USD/JPY", tv: "FX:USDJPY" },
    { label: "USD/CHF", symbol: "USD/CHF", tv: "FX:USDCHF" },
    { label: "AUD/USD", symbol: "AUD/USD", tv: "FX:AUDUSD" },
    { label: "USD/CAD", symbol: "USD/CAD", tv: "FX:USDCAD" },
    { label: "NZD/USD", symbol: "NZD/USD", tv: "FX:NZDUSD" },
    { label: "EUR/GBP", symbol: "EUR/GBP", tv: "FX:EURGBP" },
  ],
  Gold: [
    { label: "XAU/USD", symbol: "XAU/USD", tv: "OANDA:XAUUSD" },
    { label: "XAG/USD", symbol: "XAG/USD", tv: "OANDA:XAGUSD" },
  ],
  Crypto: [
    { label: "BTC/USD", symbol: "BTC/USD", tv: "COINBASE:BTCUSD" },
    { label: "ETH/USD", symbol: "ETH/USD", tv: "COINBASE:ETHUSD" },
    { label: "SOL/USD", symbol: "SOL/USD", tv: "COINBASE:SOLUSD" },
  ],
  Stocks: [
    { label: "AAPL", symbol: "AAPL", tv: "NASDAQ:AAPL" },
    { label: "MSFT", symbol: "MSFT", tv: "NASDAQ:MSFT" },
    { label: "NVDA", symbol: "NVDA", tv: "NASDAQ:NVDA" },
    { label: "TSLA", symbol: "TSLA", tv: "NASDAQ:TSLA" },
  ],
  Indices: [
    { label: "S&P 500", symbol: "SPX", tv: "SP:SPX" },
    { label: "NASDAQ 100", symbol: "NDX", tv: "NASDAQ:NDX" },
    { label: "DOW", symbol: "DJI", tv: "DJ:DJI" },
  ],
  Commodities: [
    { label: "WTI Oil", symbol: "WTI", tv: "TVC:USOIL" },
    { label: "Brent Oil", symbol: "BRENT", tv: "TVC:UKOIL" },
    { label: "Natural Gas", symbol: "NATGAS", tv: "NYMEX:NG1!" },
  ],
  ETFs: [
    { label: "SPY", symbol: "SPY", tv: "AMEX:SPY" },
    { label: "QQQ", symbol: "QQQ", tv: "NASDAQ:QQQ" },
    { label: "GLD", symbol: "GLD", tv: "AMEX:GLD" },
  ],
};

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.7 3.2 18.4 20c-.25 1.18-.91 1.47-1.85.92l-5.1-3.76-2.46 2.37c-.27.27-.5.5-1.03.5l.37-5.2 9.47-8.55c.41-.37-.09-.58-.64-.21L5.45 13.55.4 11.97c-1.1-.35-1.12-1.1.23-1.6L20.36 2.8c.91-.34 1.7.21 1.34.4Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.39-.18-2.04H12v3.86h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.18Z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.5Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.62A5.86 5.86 0 0 1 6.23 12c0-.56.11-1.11.31-1.62V7.87H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.13l3.24-2.51Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.35c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.47 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.37l3.24 2.51C7.31 8.07 9.46 6.35 12 6.35Z"
      />
    </svg>
  );
}

function LoginPage({ onLogin }) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src={logo} alt="Jirmas Signals" />

        <h1>JIRMAS SIGNALS</h1>
        <p className="auth-subtitle">
          Professional Live Market Analysis
        </p>

        <button className="google-btn" onClick={onLogin}>
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <div className="auth-links">
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer">
            <TelegramIcon />
            <span>
              <small>Need Support?</small>
              <strong>Jirmas Trader</strong>
            </span>
          </a>

          <a href={COMMUNITY_URL} target="_blank" rel="noreferrer">
            <TelegramIcon />
            <span>
              <small>Join Our Community</small>
              <strong>Jirmas Trade Zone</strong>
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}

function ActivationScreen({ email, onLogout }) {
  return (
    <main className="activation-page">
      <div className="activation-card">
        <div className="activation-lock">🔒</div>

        <img className="activation-logo" src={logo} alt="Jirmas Signals" />

        <h1>Activate Your Access</h1>

        <p className="activation-title">
          Get Lifetime Access to Jirmas Signals
        </p>

        <p className="activation-text">
          লাইফটাইম সাবস্ক্রিপশন নিতে আমাদের সাথে যোগাযোগ করুন।
        </p>

        {email && <p className="activation-email">{email}</p>}

        <a
          className="primary-action"
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
        >
          <TelegramIcon />
          Contact Jirmas Trader
        </a>

        <div className="lifetime-note">
          ✓ One-time lifetime activation
        </div>

        <p className="contact-note">
          Contact us to purchase access
        </p>

        <a
          className="community-link"
          href={COMMUNITY_URL}
          target="_blank"
          rel="noreferrer"
        >
          Join Jirmas Trade Zone
        </a>

        <button className="logout-btn" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </main>
  );
}

function TradingViewChart({ symbol }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";

    const chart = document.createElement("div");
    chart.className = "tradingview-widget-container__widget";
    wrapper.appendChild(chart);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "1",
      timezone: "Asia/Riyadh",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol]);

  return (
    <div className="chart-box tradingview-chart" ref={containerRef}>
      <div className="chart-loading">Loading TradingView...</div>
    </div>
  );
}

function calculateEMA(values, period) {
  if (!values.length) return 0;

  const multiplier = 2 / (period + 1);
  let ema = values[0];

  for (let i = 1; i < values.length; i += 1) {
    ema = (values[i] - ema) * multiplier + ema;
  }

  return ema;
}

function calculateRSI(values, period = 14) {
  if (values.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const change = values[i] - values[i - 1];

    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateATR(candles, period = 14) {
  if (candles.length <= period) return 0;

  const trs = [];

  for (let i = 1; i < candles.length; i += 1) {
    const current = candles[i];
    const previous = candles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    trs.push(tr);
  }

  const recent = trs.slice(-period);

  return recent.reduce((sum, value) => sum + value, 0) / recent.length;
}

function calculateStochastic(candles, period = 14) {
  if (candles.length < period) return 50;

  const recent = candles.slice(-period);

  const highest = Math.max(...recent.map((c) => c.high));
  const lowest = Math.min(...recent.map((c) => c.low));
  const close = recent[recent.length - 1].close;

  if (highest === lowest) return 50;

  return ((close - lowest) / (highest - lowest)) * 100;
}

function analyzeMarket(candles) {
  if (!candles || candles.length < 30) {
    return {
      signal: "WAIT",
      score: 0,
      rsi: 50,
      ema20: 0,
      ema50: 0,
      atr: 0,
      stochastic: 50,
      trend: "NEUTRAL",
      support: 0,
      resistance: 0,
    };
  }

  const closes = candles.map((c) => c.close);

  const current = closes[closes.length - 1];
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes);
  const atr = calculateATR(candles);
  const stochastic = calculateStochastic(candles);

  const recent = candles.slice(-20);

  const support = Math.min(...recent.map((c) => c.low));
  const resistance = Math.max(...recent.map((c) => c.high));

  let buy = 0;
  let sell = 0;

  if (current > ema20) buy += 20;
  if (current < ema20) sell += 20;

  if (ema20 > ema50) buy += 25;
  if (ema20 < ema50) sell += 25;

  if (rsi > 52 && rsi < 70) buy += 20;
  if (rsi < 48 && rsi > 30) sell += 20;

  if (stochastic > 50 && stochastic < 85) buy += 15;
  if (stochastic < 50 && stochastic > 15) sell += 15;

  if (current > support && current < resistance) {
    if (current > (support + resistance) / 2) buy += 10;
    else sell += 10;
  }

  const score = Math.max(buy, sell);

  let signal = "WAIT";

  if (buy >= 70 && buy > sell) signal = "BUY";
  if (sell >= 70 && sell > buy) signal = "SELL";

  return {
    signal,
    score,
    rsi,
    ema20,
    ema50,
    atr,
    stochastic,
    trend:
      ema20 > ema50
        ? "BULLISH"
        : ema20 < ema50
          ? "BEARISH"
          : "NEUTRAL",
    support,
    resistance,
  };
}

function Dashboard({ user, onLogout }) {
  const categories = Object.keys(MARKETS);

  const [category, setCategory] = useState("Forex");
  const [instrument, setInstrument] = useState(MARKETS.Forex[0]);
  const [candles, setCandles] = useState([]);
  const [marketError, setMarketError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    setInstrument(MARKETS[category][0]);
  }, [category]);

  useEffect(() => {
    let cancelled = false;

    async function loadMarket() {
      try {
        setLoading(true);
        setMarketError("");

        const response = await fetch(
          `/api/market?symbol=${encodeURIComponent(
            instrument.symbol
          )}&interval=1min&outputsize=100`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Market data unavailable");
        }

        const parsed = (data.values || [])
          .map((item) => ({
            datetime: item.datetime,
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
          }))
          .filter(
            (item) =>
              Number.isFinite(item.open) &&
              Number.isFinite(item.high) &&
              Number.isFinite(item.low) &&
              Number.isFinite(item.close)
          )
          .reverse();

        if (!cancelled) {
          setCandles(parsed);
          setLastUpdate(new Date());
        }
      } catch (error) {
        if (!cancelled) {
          setMarketError(error.message || "Market data unavailable");
          setCandles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMarket();

    const timer = setInterval(loadMarket, 15000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [instrument.symbol]);

  const analysis = useMemo(
    () => analyzeMarket(candles),
    [candles]
  );

  const currentPrice = candles.length
    ? candles[candles.length - 1].close
    : null;

  const previousPrice =
    candles.length > 1 ? candles[candles.length - 2].close : null;

  const priceChange =
    currentPrice !== null && previousPrice !== null
      ? currentPrice - previousPrice
      : 0;

  const priceDigits =
    instrument.symbol.includes("JPY") || instrument.symbol.includes("XAU")
      ? 2
      : instrument.symbol.includes("BTC") ||
          instrument.symbol.includes("ETH")
        ? 2
        : 5;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand-area">
          <img src={logo} alt="Jirmas Signals" />
          <div>
            <strong>JIRMAS SIGNALS</strong>
            <span>LIVE MARKET ANALYSIS</span>
          </div>
        </div>

        <div className="user-area">
          <span>{user?.email}</span>
          <button onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="market-category-box">
          <div className="section-label">MARKETS</div>

          <div className="horizontal-scroll">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "market-tab active" : "market-tab"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="instrument-box">
          <div className="section-label">{category}</div>

          <div className="horizontal-scroll">
            {MARKETS[category].map((item) => (
              <button
                key={item.label}
                className={
                  instrument.label === item.label
                    ? "instrument-tab active"
                    : "instrument-tab"
                }
                onClick={() => setInstrument(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <section className="market-overview">
          <div>
            <span className="overview-label">MARKET</span>
            <h2>{instrument.label}</h2>
          </div>

          <div className="price-area">
            <span className="overview-label">LIVE PRICE</span>
            <strong>
              {currentPrice !== null
                ? currentPrice.toFixed(priceDigits)
                : "--"}
            </strong>

            <small className={priceChange >= 0 ? "positive" : "negative"}>
              {currentPrice !== null
                ? `${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(
                    priceDigits
                  )}`
                : "--"}
            </small>
          </div>
        </section>

        <section className="chart-section">
          <div className="section-heading">
            <div>
              <span className="section-label">LIVE CHART</span>
              <h3>{instrument.label}</h3>
            </div>

            <span className="live-dot">
              <i /> LIVE
            </span>
          </div>

          <TradingViewChart symbol={instrument.tv} />
        </section>

        {marketError && (
          <div className="connection-state">
            <span>Market data temporarily unavailable</span>
            <small>Please check the data connection.</small>
          </div>
        )}

        {!marketError && loading && (
          <div className="connection-state">
            <span>Connecting to live market data...</span>
          </div>
        )}

        <section className="signal-card">
          <div className="signal-top">
            <div>
              <span className="section-label">JIRMAS SIGNAL</span>
              <h2 className={`signal-${analysis.signal.toLowerCase()}`}>
                {analysis.signal}
              </h2>
            </div>

            <div className="confidence">
              <strong>{analysis.score}%</strong>
              <span>Technical Confirmation</span>
            </div>
          </div>

          <div className="signal-bar">
            <div style={{ width: `${analysis.score}%` }} />
          </div>

          <div className="signal-grid">
            <div>
              <span>Trend</span>
              <strong>{analysis.trend}</strong>
            </div>

            <div>
              <span>RSI</span>
              <strong>{analysis.rsi.toFixed(1)}</strong>
            </div>

            <div>
              <span>Stochastic</span>
              <strong>{analysis.stochastic.toFixed(1)}</strong>
            </div>

            <div>
              <span>ATR</span>
              <strong>
                {analysis.atr
                  ? analysis.atr.toFixed(priceDigits)
                  : "--"}
              </strong>
            </div>
          </div>
        </section>

        <section className="levels-card">
          <div>
            <span>SUPPORT</span>
            <strong>
              {analysis.support
                ? analysis.support.toFixed(priceDigits)
                : "--"}
            </strong>
          </div>

          <div>
            <span>RESISTANCE</span>
            <strong>
              {analysis.resistance
                ? analysis.resistance.toFixed(priceDigits)
                : "--"}
            </strong>
          </div>

          <div>
            <span>EMA 20</span>
            <strong>
              {analysis.ema20
                ? analysis.ema20.toFixed(priceDigits)
                : "--"}
            </strong>
          </div>

          <div>
            <span>EMA 50</span>
            <strong>
              {analysis.ema50
                ? analysis.ema50.toFixed(priceDigits)
                : "--"}
            </strong>
          </div>
        </section>

        <section className="timing-card">
          <div>
            <span>TIMEFRAME</span>
            <strong>1 MINUTE</strong>
          </div>

          <div>
            <span>DATA STATUS</span>
            <strong>
              {marketError ? "OFFLINE" : loading ? "CONNECTING" : "LIVE"}
            </strong>
          </div>

          <div>
            <span>LAST UPDATE</span>
            <strong>
              {lastUpdate
                ? lastUpdate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "--"}
            </strong>
          </div>
        </section>

        <div className="dashboard-actions">
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer">
            <TelegramIcon />
            Support
          </a>

          <a href={COMMUNITY_URL} target="_blank" rel="noreferrer">
            <TelegramIcon />
            Trade Zone
          </a>
        </div>

        <p className="disclaimer">
          Jirmas Signals provides technical market analysis only. Signals
          are not guaranteed and are not financial advice. Always manage
          your risk responsibly.
        </p>
      </section>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [access, setAccess] = useState(null);
  const [checking, setChecking] = useState(true);

  async function checkAccess(userId) {
    if (!userId) {
      setAccess(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_access")
      .select("is_active")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Access check error:", error);
      setAccess(false);
      return;
    }

    setAccess(Boolean(data?.is_active));
  }

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session);

      if (data.session?.user) {
        await checkAccess(data.session.user.id);
      } else {
        setAccess(false);
      }

      setChecking(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession?.user) {
        await checkAccess(newSession.user.id);
      } else {
        setAccess(false);
      }

      setChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(error);
      alert("Google login failed. Please try again.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setAccess(false);
  }

  if (checking) {
    return (
      <div className="app-loading">
        <img src={logo} alt="Jirmas Signals" />
        <span>Loading Jirmas Signals...</span>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onLogin={handleGoogleLogin} />;
  }

  if (!access) {
    return (
      <ActivationScreen
        email={session.user?.email}
        onLogout={handleLogout}
      />
    );
  }

  return <Dashboard user={session.user} onLogout={handleLogout} />;
}