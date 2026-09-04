import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabaseClient";
import logo from "./assets/IMG_5520.PNG";

const SUPPORT_URL = "https://t.me/Jirmas_Trader";
const COMMUNITY_URL = "https://t.me/jirmastradezone";

const MARKETS = {
  Forex: [
    ["EUR/USD", "EUR/USD"],
    ["GBP/USD", "GBP/USD"],
    ["USD/JPY", "USD/JPY"],
    ["USD/CHF", "USD/CHF"],
    ["AUD/USD", "AUD/USD"],
    ["USD/CAD", "USD/CAD"],
    ["NZD/USD", "NZD/USD"],
  ],
  Gold: [
    ["XAU/USD", "XAU/USD"],
    ["XAG/USD", "XAG/USD"],
  ],
  Crypto: [
    ["BTC/USD", "BTC/USD"],
    ["ETH/USD", "ETH/USD"],
    ["BNB/USD", "BNB/USD"],
    ["SOL/USD", "SOL/USD"],
    ["XRP/USD", "XRP/USD"],
  ],
  Stocks: [
    ["AAPL", "AAPL"],
    ["TSLA", "TSLA"],
    ["NVDA", "NVDA"],
    ["AMZN", "AMZN"],
    ["MSFT", "MSFT"],
    ["META", "META"],
  ],
  Indices: [
    ["S&P 500", "SPX"],
    ["NASDAQ 100", "NDX"],
    ["DOW", "DJI"],
  ],
  Commodities: [
    ["BRENT", "BRENT"],
    ["WTI", "WTI"],
  ],
  ETFs: [
    ["SPY", "SPY"],
    ["QQQ", "QQQ"],
    ["DIA", "DIA"],
  ],
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.78-.07-1.53-.23-2.25H12v4.26h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.39Z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.55 0-4.71-1.72-5.49-4.03H3.26v2.52A9.74 9.74 0 0 0 12 21.6Z"
      />
      <path
        fill="#FBBC05"
        d="M6.51 13.7a5.86 5.86 0 0 1 0-3.4V7.78H3.26a9.7 9.7 0 0 0 0 8.44l3.25-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.27c1.43 0 2.72.49 3.74 1.45l2.8-2.8C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.74 5.38l3.25 2.52C7.29 7.99 9.45 6.27 12 6.27Z"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M21.4 4.6 18.2 20c-.24 1.09-.89 1.36-1.8.85l-5-3.69-2.41 2.32c-.27.27-.5.5-1.03.5l.37-5.11 9.3-8.4c.4-.36-.09-.56-.62-.2L5.5 13.67.6 12.13c-1.07-.34-1.09-1.07.22-1.56L20 3.12c.9-.33 1.69.2 1.4 1.48Z"
      />
    </svg>
  );
}

function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} className="login-logo" alt="Jirmas Signals" />

        <h1 className="login-title">JIRMAS SIGNALS</h1>

        <p className="login-subtitle">
          PROFESSIONAL LIVE MARKET ANALYSIS
        </p>

        <button className="google-login-btn" onClick={onLogin}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="login-divider">
          <span>Need Support?</span>
        </div>

        <a
          className="telegram-link"
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
        >
          <TelegramIcon />
          <span>Jirmas Trader</span>
        </a>

        <div className="login-divider community-divider">
          <span>Join Our Community</span>
        </div>

        <a
          className="telegram-link community"
          href={COMMUNITY_URL}
          target="_blank"
          rel="noreferrer"
        >
          <TelegramIcon />
          <span>Jirmas Trade Zone</span>
        </a>
      </div>
    </div>
  );
}

function ActivationScreen({ onLogout }) {
  return (
    <div className="activation-page">
      <div className="activation-card">
        <div className="activation-logo-wrap">
          <img src={logo} alt="Jirmas Signals" />
        </div>

        <div className="lock-icon">🔐</div>

        <h1>Activate Your Access</h1>

        <p className="activation-main">
          Get Lifetime Access to Jirmas Signals
        </p>

        <p className="activation-text">
          লাইফটাইম সাবস্ক্রিপশন নিতে আমাদের সাথে যোগাযোগ করুন।
        </p>

        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
          className="activation-button"
        >
          <TelegramIcon />
          Contact Jirmas Trader
        </a>

        <div className="lifetime-badge">
          ✓ One-time lifetime activation
        </div>

        <a
          href={COMMUNITY_URL}
          target="_blank"
          rel="noreferrer"
          className="activation-community"
        >
          Join Jirmas Trade Zone
        </a>

        <button className="logout-small" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function calculateEMA(values, period) {
  if (values.length < period) return null;

  const multiplier = 2 / (period + 1);
  let ema = values
    .slice(0, period)
    .reduce((sum, value) => sum + value, 0) / period;

  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
  }

  return ema;
}

function calculateRSI(values, period = 14) {
  if (values.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];

    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    averageGain =
      (averageGain * (period - 1) + gain) / period;

    averageLoss =
      (averageLoss * (period - 1) + loss) / period;
  }

  if (averageLoss === 0) return 100;

  const rs = averageGain / averageLoss;
  return 100 - 100 / (1 + rs);
}

function calculateATR(candles, period = 14) {
  if (candles.length <= period) return null;

  const trueRanges = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previous = candles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    trueRanges.push(tr);
  }

  const recent = trueRanges.slice(-period);

  return recent.reduce((sum, value) => sum + value, 0) / recent.length;
}

function calculateStoch(candles, period = 14) {
  if (candles.length < period) return null;

  const recent = candles.slice(-period);

  const highest = Math.max(...recent.map((c) => c.high));
  const lowest = Math.min(...recent.map((c) => c.low));
  const close = recent[recent.length - 1].close;

  if (highest === lowest) return 50;

  return ((close - lowest) / (highest - lowest)) * 100;
}

function getSignal(candles) {
  if (candles.length < 55) {
    return {
      signal: "WAIT",
      score: 0,
      note: "Waiting for enough market data",
    };
  }

  const closes = candles.map((c) => c.close);

  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes);
  const stoch = calculateStoch(candles);
  const current = closes[closes.length - 1];

  let buy = 0;
  let sell = 0;

  if (current > ema20) buy += 20;
  else sell += 20;

  if (ema20 > ema50) buy += 25;
  else sell += 25;

  if (rsi > 55 && rsi < 75) buy += 20;
  if (rsi < 45 && rsi > 25) sell += 20;

  if (stoch > 55 && stoch < 85) buy += 15;
  if (stoch < 45 && stoch > 15) sell += 15;

  const previous = closes[closes.length - 2];

  if (current > previous) buy += 20;
  else if (current < previous) sell += 20;

  const score = Math.max(buy, sell);

  if (score >= 70 && buy > sell) {
    return {
      signal: "BUY",
      score,
      note: "Bullish technical confirmation",
    };
  }

  if (score >= 70 && sell > buy) {
    return {
      signal: "SELL",
      score,
      note: "Bearish technical confirmation",
    };
  }

  return {
    signal: "WAIT",
    score,
    note: "Market conditions are not strong enough",
  };
}

function formatPrice(value) {
  if (value === null || value === undefined) return "--";

  if (value >= 1000) return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

  if (value >= 10) return value.toFixed(3);

  return value.toFixed(5);
}

function SignalChart({ candles }) {
  if (!candles.length) {
    return (
      <div className="chart-card">
        <div className="chart-empty">
          Waiting for live candles...
        </div>
      </div>
    );
  }

  const data = candles.slice(-70);

  const width = 900;
  const height = 360;
  const padding = 35;

  const highs = data.map((c) => c.high);
  const lows = data.map((c) => c.low);

  const max = Math.max(...highs);
  const min = Math.min(...lows);

  const range = max - min || 1;

  const candleWidth = (width - padding * 2) / data.length;

  const y = (price) =>
    padding +
    ((max - price) / range) *
      (height - padding * 2);

  return (
    <div className="chart-card">
      <div className="chart-top">
        <span>LIVE 1 MINUTE CHART</span>
        <span className="chart-live">
          <i></i> LIVE
        </span>
      </div>

      <svg
        className="chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="chartGlow"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#12e8a0" stopOpacity=".22" />
            <stop offset="100%" stopColor="#12e8a0" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={padding}
          x2={width - padding}
          y1={height / 2}
          y2={height / 2}
          className="chart-grid"
        />

        {data.map((candle, index) => {
          const x =
            padding +
            index * candleWidth +
            candleWidth / 2;

          const openY = y(candle.open);
          const closeY = y(candle.close);
          const highY = y(candle.high);
          const lowY = y(candle.low);

          const bullish = candle.close >= candle.open;

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(
            Math.abs(closeY - openY),
            2
          );

          return (
            <g key={`${candle.datetime}-${index}`}>
              <line
                x1={x}
                x2={x}
                y1={highY}
                y2={lowY}
                className={
                  bullish
                    ? "candle-wick bullish"
                    : "candle-wick bearish"
                }
              />

              <rect
                x={x - candleWidth * 0.28}
                y={bodyTop}
                width={candleWidth * 0.56}
                height={bodyHeight}
                rx="1"
                className={
                  bullish
                    ? "candle-body bullish"
                    : "candle-body bearish"
                }
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const categories = Object.keys(MARKETS);

  const [category, setCategory] = useState("Forex");
  const [symbol, setSymbol] = useState("EUR/USD");
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_KEY =
    import.meta.env.VITE_TWELVE_DATA_API_KEY;

  const marketList = MARKETS[category];

  useEffect(() => {
    if (!marketList.some(([name]) => name === symbol)) {
      setSymbol(marketList[0][0]);
    }
  }, [category]);

  async function loadMarket() {
    if (!API_KEY) {
      setError(
        "Market data API key is not configured."
      );
      setLoading(false);
      return;
    }

    try {
      setError("");

      const apiSymbol =
        MARKETS[category].find(
          ([name]) => name === symbol
        )?.[1] || symbol;

      const url =
        `https://api.twelvedata.com/time_series` +
        `?symbol=${encodeURIComponent(apiSymbol)}` +
        `&interval=1min` +
        `&outputsize=120` +
        `&timezone=UTC` +
        `&apikey=${encodeURIComponent(API_KEY)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "error" || !data.values) {
        throw new Error(
          data.message || "Unable to load market data."
        );
      }

      const parsed = data.values
        .map((item) => ({
          datetime: item.datetime,
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
        }))
        .reverse();

      setCandles(parsed);
    } catch (err) {
      setError(err.message);
      setCandles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadMarket();

    const timer = setInterval(loadMarket, 15000);

    return () => clearInterval(timer);
  }, [symbol, category]);

  const analysis = useMemo(
    () => getSignal(candles),
    [candles]
  );

  const closes = candles.map((c) => c.close);

  const currentPrice =
    closes.length ? closes[closes.length - 1] : null;

  const previousPrice =
    closes.length > 1
      ? closes[closes.length - 2]
      : null;

  const change =
    currentPrice && previousPrice
      ? ((currentPrice - previousPrice) /
          previousPrice) *
        100
      : 0;

  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes);
  const atr = calculateATR(candles);
  const stoch = calculateStoch(candles);

  const support = candles.length
    ? Math.min(
        ...candles.slice(-30).map((c) => c.low)
      )
    : null;

  const resistance = candles.length
    ? Math.max(
        ...candles.slice(-30).map((c) => c.high)
      )
    : null;

  const signalClass =
    analysis.signal.toLowerCase();

  return (
    <div className="dashboard">

      {/* HEADER */}

      <header className="dashboard-header">
        <div className="brand">
          <img
            src={logo}
            className="brand-logo"
            alt="Jirmas"
          />

          <div className="brand-text">
            <h1>JIRMAS SIGNALS</h1>
            <p>LIVE MARKET INTELLIGENCE</p>
          </div>
        </div>

        <div className="header-right">
          <span className="live-badge">
            <i></i> LIVE
          </span>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* MARKET CATEGORY */}

      <section className="dashboard-section">
        <div className="section-label">
          MARKET
        </div>

        <div className="market-box">
          <div className="market-tabs">
            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "market-tab active"
                    : "market-tab"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET SYMBOL */}

      <section className="dashboard-section">
        <div className="section-label">
          SELECT INSTRUMENT
        </div>

        <div className="market-box symbol-box">
          <div className="market-selector">
            {marketList.map(([name]) => (
              <button
                key={name}
                className={
                  symbol === name
                    ? "market-button active"
                    : "market-button"
                }
                onClick={() => setSymbol(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET HEADER */}

      <section className="market-overview">
        <div>
          <div className="market-name">
            {symbol}
          </div>

          <div className="market-timeframe">
            1 MINUTE • LIVE MARKET DATA
          </div>
        </div>

        <div className="market-price-wrap">
          <div className="market-price">
            {formatPrice(currentPrice)}
          </div>

          <div
            className={
              change >= 0
                ? "market-change positive"
                : "market-change negative"
            }
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(3)}%
          </div>
        </div>
      </section>

      {/* CHART */}

      <section className="dashboard-section chart-section">
        {loading && !candles.length ? (
          <div className="chart-card chart-loading">
            <div className="spinner"></div>
            Loading live market data...
          </div>
        ) : (
          <SignalChart candles={candles} />
        )}

        {error && (
          <div className="market-error">
            <strong>Market Data Error</strong>
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* SIGNAL */}

      <section className="signal-card-section">
        <div
          className={`signal-card ${signalClass}`}
        >
          <div className="signal-heading">
            CURRENT SIGNAL
          </div>

          <div className="signal-value">
            {analysis.signal}
          </div>

          <div className="signal-score">
            <strong>{analysis.score}%</strong>
            <span>TECHNICAL CONFIRMATION</span>
          </div>

          <div className="signal-bar">
            <div
              style={{
                width: `${Math.min(
                  analysis.score,
                  100
                )}%`,
              }}
            />
          </div>

          <p>{analysis.note}</p>
        </div>
      </section>

      {/* INDICATORS */}

      <section className="dashboard-section">
        <div className="section-label">
          TECHNICAL INDICATORS
        </div>

        <div className="indicators-grid">

          <div className="indicator-card">
            <span>RSI 14</span>
            <strong>
              {rsi ? rsi.toFixed(1) : "--"}
            </strong>
            <small
              className={
                rsi > 55
                  ? "bullish"
                  : rsi < 45
                  ? "bearish"
                  : "neutral"
              }
            >
              {rsi > 55
                ? "BULLISH"
                : rsi < 45
                ? "BEARISH"
                : "NEUTRAL"}
            </small>
          </div>

          <div className="indicator-card">
            <span>EMA 20</span>
            <strong>
              {formatPrice(ema20)}
            </strong>
            <small>FAST TREND</small>
          </div>

          <div className="indicator-card">
            <span>EMA 50</span>
            <strong>
              {formatPrice(ema50)}
            </strong>
            <small>SLOW TREND</small>
          </div>

          <div className="indicator-card">
            <span>ATR 14</span>
            <strong>
              {formatPrice(atr)}
            </strong>
            <small>VOLATILITY</small>
          </div>

          <div className="indicator-card">
            <span>STOCH</span>
            <strong>
              {stoch ? stoch.toFixed(1) : "--"}
            </strong>
            <small>
              {stoch > 50
                ? "BULLISH"
                : "BEARISH"}
            </small>
          </div>

          <div className="indicator-card">
            <span>TREND</span>
            <strong>
              {ema20 && ema50
                ? ema20 > ema50
                  ? "UP"
                  : "DOWN"
                : "--"}
            </strong>
            <small>
              {ema20 && ema50
                ? ema20 > ema50
                  ? "BULLISH"
                  : "BEARISH"
                : "WAIT"}
            </small>
          </div>

        </div>
      </section>

      {/* LEVELS */}

      <section className="dashboard-section">
        <div className="section-label">
          KEY LEVELS
        </div>

        <div className="levels-grid">

          <div className="level-card support">
            <span>SUPPORT</span>
            <strong>
              {formatPrice(support)}
            </strong>
          </div>

          <div className="level-card resistance">
            <span>RESISTANCE</span>
            <strong>
              {formatPrice(resistance)}
            </strong>
          </div>

        </div>
      </section>

      {/* TRADE TIMING */}

      <section className="dashboard-section">
        <div className="section-label">
          SIGNAL TIMING
        </div>

        <div className="timing-card">

          <div>
            <span>ENTRY</span>
            <strong>
              {analysis.signal === "WAIT"
                ? "WAIT"
                : "NEXT CANDLE"}
            </strong>
          </div>

          <div>
            <span>EXPIRY</span>
            <strong>1 MIN</strong>
          </div>

          <div>
            <span>TIMEZONE</span>
            <strong>UTC+6</strong>
          </div>

        </div>
      </section>

      {/* DISCLAIMER */}

      <div className="dashboard-note">
        Technical confirmation is an analytical score,
        not a guaranteed win probability. Always manage
        risk carefully.
      </div>

      {/* ACTIONS */}

      <div className="dashboard-actions">

        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
          className="action-button support"
        >
          <TelegramIcon />
          Support
        </a>

        <a
          href={COMMUNITY_URL}
          target="_blank"
          rel="noreferrer"
          className="action-button community-action"
        >
          <TelegramIcon />
          Community
        </a>

      </div>

    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [access, setAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  async function checkAccess(userId) {
    const { data, error } = await supabase
      .from("user_access")
      .select("is_active")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error(error);
      setAccess(false);
    } else {
      setAccess(Boolean(data?.is_active));
    }

    setChecking(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);

      if (data.session?.user) {
        checkAccess(data.session.user.id);
      } else {
        setChecking(false);
      }
    });

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          checkAccess(newSession.user.id);
        } else {
          setAccess(false);
          setChecking(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (checking) {
    return (
      <div className="app-loading">
        <img src={logo} alt="Jirmas" />
        <div>Loading JIRMAS SIGNALS...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginPage
        onLogin={handleGoogleLogin}
      />
    );
  }

  if (!access) {
    return (
      <ActivationScreen
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Dashboard
      onLogout={handleLogout}
    />
  );
}

export default App;