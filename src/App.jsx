import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import logo from "./assets/IMG_5520.PNG";
import "./App.css";

const SUPPORT_URL = "https://t.me/Jirmas_Trader";
const COMMUNITY_URL = "https://t.me/jirmastradezone";
const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;

const MARKETS = {
  Forex: [
    { name: "EUR/USD", symbol: "EUR/USD", tv: "OANDA:EURUSD" },
    { name: "GBP/USD", symbol: "GBP/USD", tv: "OANDA:GBPUSD" },
    { name: "USD/JPY", symbol: "USD/JPY", tv: "OANDA:USDJPY" },
    { name: "USD/CHF", symbol: "USD/CHF", tv: "OANDA:USDCHF" },
    { name: "AUD/USD", symbol: "AUD/USD", tv: "OANDA:AUDUSD" },
    { name: "USD/CAD", symbol: "USD/CAD", tv: "OANDA:USDCAD" },
    { name: "NZD/USD", symbol: "NZD/USD", tv: "OANDA:NZDUSD" },
  ],
  Gold: [
    { name: "XAU/USD", symbol: "XAU/USD", tv: "OANDA:XAUUSD" },
  ],
  Crypto: [
    { name: "BTC/USD", symbol: "BTC/USD", tv: "OANDA:BTCUSD" },
    { name: "ETH/USD", symbol: "ETH/USD", tv: "OANDA:ETHUSD" },
  ],
};

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.23Z"/>
      <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0 0 12 21.75Z"/>
      <path fill="#FBBC05" d="M6.54 13.85A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.85V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.37l3.24-2.52Z"/>
      <path fill="#EA4335" d="M12 6.12c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.22 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.63l3.24 2.52C7.31 7.84 9.46 6.12 12 6.12Z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="telegram-icon" viewBox="0 0 24 24">
      <path fill="currentColor" d="M21.4 3.2 18.2 20c-.24 1.18-.87 1.47-1.77.91l-4.86-3.58-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.95 9-8.13c.39-.35-.09-.55-.61-.2L6.05 13.56 1.3 12.07c-1.03-.32-1.05-1.03.22-1.5L20.08 3.3c.87-.32 1.63.2 1.32-.1Z"/>
    </svg>
  );
}

function LoginPage({ onLogin, loading, error }) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand">
          <img src={logo} alt="Jirmas Signals" className="brand-logo" />
          <h1>JIRMAS SIGNALS</h1>
          <p>Professional Market Signals</p>
        </div>

        <button
          className="google-login-btn"
          onClick={onLogin}
          disabled={loading}
        >
          <GoogleIcon />
          <span>{loading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        {error && <div className="error-message">{error}</div>}

        <div className="login-divider">
          <span>Need help?</span>
        </div>

        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
          className="telegram-card"
        >
          <div className="telegram-circle">
            <TelegramIcon />
          </div>
          <div className="telegram-content">
            <strong>Need Support?</strong>
            <span>Jirmas Trader</span>
          </div>
          <span className="arrow">›</span>
        </a>

        <a
          href={COMMUNITY_URL}
          target="_blank"
          rel="noreferrer"
          className="telegram-card"
        >
          <div className="telegram-circle">
            <TelegramIcon />
          </div>
          <div className="telegram-content">
            <strong>Join Our Community</strong>
            <span>Jirmas Trade Zone</span>
          </div>
          <span className="arrow">›</span>
        </a>

        <p className="login-footer">
          Secure access powered by JIRMAS SIGNALS
        </p>
      </section>
    </main>
  );
}

function ema(values, period) {
  if (values.length < period) return null;

  const multiplier = 2 / (period + 1);
  let previous = values
    .slice(0, period)
    .reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < values.length; i++) {
    previous = (values[i] - previous) * multiplier + previous;
  }

  return previous;
}

function rsi(values, period = 14) {
  if (values.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function atr(candles, period = 14) {
  if (candles.length < period + 1) return null;

  const trs = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previous = candles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    trs.push(tr);
  }

  if (trs.length < period) return null;

  let value =
    trs.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < trs.length; i++) {
    value = ((value * (period - 1)) + trs[i]) / period;
  }

  return value;
}

function macd(values) {
  if (values.length < 35) {
    return { macd: null, signal: null, histogram: null };
  }

  const fast = [];
  const slow = [];

  for (let i = 0; i < values.length; i++) {
    if (i >= 11) fast.push(ema(values.slice(0, i + 1), 12));
    if (i >= 25) slow.push(ema(values.slice(0, i + 1), 26));
  }

  const macdValues = [];

  for (let i = 0; i < values.length; i++) {
    const e12 = ema(values.slice(0, i + 1), 12);
    const e26 = ema(values.slice(0, i + 1), 26);

    if (e12 !== null && e26 !== null) {
      macdValues.push(e12 - e26);
    }
  }

  if (macdValues.length < 9) {
    return { macd: null, signal: null, histogram: null };
  }

  const macdLine = macdValues[macdValues.length - 1];
  const signalLine = ema(macdValues, 9);

  return {
    macd: macdLine,
    signal: signalLine,
    histogram:
      signalLine === null ? null : macdLine - signalLine,
  };
}

function stochastic(candles, period = 14) {
  if (candles.length < period) return null;

  const recent = candles.slice(-period);

  const highest = Math.max(...recent.map((c) => c.high));
  const lowest = Math.min(...recent.map((c) => c.low));
  const close = recent[recent.length - 1].close;

  if (highest === lowest) return 50;

  return ((close - lowest) / (highest - lowest)) * 100;
}

function calculateSignal(candles) {
  if (candles.length < 60) {
    return {
      signal: "WAIT",
      confidence: 0,
      rsi: null,
      macd: null,
      atr: null,
      ema20: null,
      ema50: null,
      stochastic: null,
      support: null,
      resistance: null,
    };
  }

  const closed = candles.slice(0, -1);
  const closes = closed.map((c) => c.close);

  const last = closed[closed.length - 1];
  const previous = closed[closed.length - 2];

  const ema20Value = ema(closes, 20);
  const ema50Value = ema(closes, 50);
  const rsiValue = rsi(closes, 14);
  const atrValue = atr(closed, 14);
  const macdValue = macd(closes);
  const stochasticValue = stochastic(closed, 14);

  let buy = 0;
  let sell = 0;

  if (ema20Value > ema50Value) buy += 25;
  if (ema20Value < ema50Value) sell += 25;

  if (rsiValue > 50 && rsiValue < 70) buy += 20;
  if (rsiValue < 50 && rsiValue > 30) sell += 20;

  if (macdValue.macd > macdValue.signal) buy += 20;
  if (macdValue.macd < macdValue.signal) sell += 20;

  if (stochasticValue > 50 && stochasticValue < 80) buy += 15;
  if (stochasticValue < 50 && stochasticValue > 20) sell += 15;

  if (last.close > previous.close) buy += 20;
  if (last.close < previous.close) sell += 20;

  const body = Math.abs(last.close - last.open);
  const range = last.high - last.low;

  const strongCandle = range > 0 && body / range >= 0.45;

  if (!strongCandle) {
    buy = 0;
    sell = 0;
  }

  let signal = "WAIT";
  let confidence = Math.max(buy, sell);

  if (buy >= 80 && buy > sell && buy - sell >= 20) {
    signal = "BUY";
  } else if (sell >= 80 && sell > buy && sell - buy >= 20) {
    signal = "SELL";
  } else {
    confidence = 0;
  }

  const support = Math.min(...closed.slice(-30).map((c) => c.low));
  const resistance = Math.max(...closed.slice(-30).map((c) => c.high));

  return {
    signal,
    confidence,
    rsi: rsiValue,
    macd: macdValue,
    atr: atrValue,
    ema20: ema20Value,
    ema50: ema50Value,
    stochastic: stochasticValue,
    support,
    resistance,
  };
}

function formatPrice(value, symbol) {
  if (value === null || value === undefined) return "--";

  if (symbol.includes("JPY")) {
    return Number(value).toFixed(3);
  }

  if (symbol.includes("BTC")) {
    return Number(value).toFixed(2);
  }

  if (symbol.includes("ETH")) {
    return Number(value).toFixed(2);
  }

  if (symbol.includes("XAU")) {
    return Number(value).toFixed(2);
  }

  return Number(value).toFixed(5);
}

function MarketChart({ candles }) {
  const visible = candles.slice(-45);

  if (!visible.length) {
    return (
      <div className="chart-placeholder">
        <span>WAITING FOR MARKET DATA...</span>
      </div>
    );
  }

  const width = 900;
  const height = 360;
  const padding = 35;

  const highs = visible.map((c) => c.high);
  const lows = visible.map((c) => c.low);

  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const range = max - min || 1;

  const candleWidth = (width - padding * 2) / visible.length;

  const y = (price) =>
    height - padding - ((price - min) / range) * (height - padding * 2);

  return (
    <div className="real-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <line
          x1={padding}
          x2={width - padding}
          y1={height / 2}
          y2={height / 2}
          className="chart-grid"
        />

        {visible.map((candle, index) => {
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
            2,
            Math.abs(closeY - openY)
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
                x={x - candleWidth * 0.3}
                y={bodyTop}
                width={candleWidth * 0.6}
                height={bodyHeight}
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

      <div className="chart-labels">
        <span>{formatPrice(max, "")}</span>
        <span>{formatPrice(min, "")}</span>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [category, setCategory] = useState("Forex");
  const [market, setMarket] = useState(MARKETS.Forex[0]);

  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const analysis = useMemo(
    () => calculateSignal(candles),
    [candles]
  );

  async function loadMarket() {
    if (!API_KEY) {
      setDataError("Market API is not configured.");
      setLoading(false);
      return;
    }

    try {
      setDataError("");

      const url =
        `https://api.twelvedata.com/time_series` +
        `?symbol=${encodeURIComponent(market.symbol)}` +
        `&interval=1min` +
        `&outputsize=120` +
        `&timezone=UTC` +
        `&apikey=${encodeURIComponent(API_KEY)}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(
          result.message || "Unable to load market data."
        );
      }

      const values = (result.values || [])
        .map((item) => ({
          datetime: item.datetime,
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
        }))
        .filter(
          (c) =>
            Number.isFinite(c.open) &&
            Number.isFinite(c.high) &&
            Number.isFinite(c.low) &&
            Number.isFinite(c.close)
        )
        .reverse();

      setCandles(values);
    } catch (error) {
      console.error(error);
      setDataError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCandles([]);
    setLoading(true);
    loadMarket();

    const interval = setInterval(loadMarket, 15000);

    return () => clearInterval(interval);
  }, [market.symbol]);

  const latest =
    candles.length > 0
      ? candles[candles.length - 1]
      : null;

  const previous =
    candles.length > 1
      ? candles[candles.length - 2]
      : null;

  const priceChange =
    latest && previous
      ? latest.close - previous.close
      : 0;

  const pricePercent =
    latest && previous && previous.close !== 0
      ? (priceChange / previous.close) * 100
      : 0;

  function changeCategory(newCategory) {
    setCategory(newCategory);
    setMarket(MARKETS[newCategory][0]);
  }

  return (
    <main className="dashboard-preview">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <img src={logo} alt="Jirmas Signals" />
          <div>
            <strong>JIRMAS SIGNALS</strong>
            <span>LIVE MARKET ANALYSIS</span>
          </div>
        </div>

        <div className="live-status">
          <span /> LIVE
        </div>
      </header>

      <div className="dashboard-body">

        <div className="market-tabs">
          {Object.keys(MARKETS).map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => changeCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="market-selector">
          {MARKETS[category].map((item) => (
            <button
              key={item.name}
              className={
                market.name === item.name ? "active" : ""
              }
              onClick={() => setMarket(item)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="market-title">
          <div>
            <span>{market.name}</span>
            <small>1 MINUTE • LIVE</small>
          </div>

          <div className="price-block">
            <strong>
              {latest
                ? formatPrice(latest.close, market.symbol)
                : "--"}
            </strong>

            <span
              className={
                priceChange >= 0 ? "price-up" : "price-down"
              }
            >
              {priceChange >= 0 ? "+" : ""}
              {pricePercent.toFixed(3)}%
            </span>
          </div>
        </div>

        {loading ? (
          <div className="chart-placeholder">
            <div className="loading-spinner" />
            <span>LOADING LIVE MARKET DATA...</span>
          </div>
        ) : (
          <MarketChart candles={candles} />
        )}

        {dataError && (
          <div className="market-error">
            {dataError}
          </div>
        )}

        <div className={`signal-placeholder signal-${analysis.signal.toLowerCase()}`}>
          <small>CURRENT SIGNAL</small>

          <strong>
            {analysis.signal}
          </strong>

          <span>
            {analysis.signal === "WAIT"
              ? "Market conditions are not strong enough"
              : `${analysis.confidence}% technical strength`}
          </span>
        </div>

        <div className="stats-row">
          <div>
            <span>RSI 14</span>
            <strong>
              {analysis.rsi !== null
                ? analysis.rsi.toFixed(1)
                : "--"}
            </strong>
          </div>

          <div>
            <span>MACD</span>
            <strong>
              {analysis.macd?.macd !== null &&
              analysis.macd?.macd !== undefined
                ? analysis.macd.macd.toFixed(5)
                : "--"}
            </strong>
          </div>

          <div>
            <span>ATR 14</span>
            <strong>
              {analysis.atr !== null
                ? analysis.atr.toFixed(5)
                : "--"}
            </strong>
          </div>
        </div>

        <div className="technical-row">
          <div>
            <span>EMA 20</span>
            <strong>
              {analysis.ema20 !== null
                ? formatPrice(analysis.ema20, market.symbol)
                : "--"}
            </strong>
          </div>

          <div>
            <span>EMA 50</span>
            <strong>
              {analysis.ema50 !== null
                ? formatPrice(analysis.ema50, market.symbol)
                : "--"}
            </strong>
          </div>

          <div>
            <span>STOCH</span>
            <strong>
              {analysis.stochastic !== null
                ? analysis.stochastic.toFixed(1)
                : "--"}
            </strong>
          </div>
        </div>

        <div className="levels-row">
          <div>
            <span>SUPPORT</span>
            <strong>
              {analysis.support !== null
                ? formatPrice(
                    analysis.support,
                    market.symbol
                  )
                : "--"}
            </strong>
          </div>

          <div>
            <span>RESISTANCE</span>
            <strong>
              {analysis.resistance !== null
                ? formatPrice(
                    analysis.resistance,
                    market.symbol
                  )
                : "--"}
            </strong>
          </div>
        </div>

        <div className="signal-timing">
          <div>
            <span>ENTRY</span>
            <strong>
              {analysis.signal === "WAIT"
                ? "WAIT"
                : "NEXT 1 MIN"}
            </strong>
          </div>

          <div>
            <span>EXPIRY</span>
            <strong>
              {analysis.signal === "WAIT"
                ? "--"
                : "1 MINUTE"}
            </strong>
          </div>

          <div>
            <span>TIMEZONE</span>
            <strong>UTC+6</strong>
          </div>
        </div>

        <div className="dashboard-footer">
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
          >
            <TelegramIcon />
            Support
          </a>

          <button onClick={onLogout}>
            Sign out
          </button>
        </div>

      </div>
    </main>
  );
}

function ActivationScreen({ onLogout }) {
  return (
    <div className="activation-screen">
      <div className="locked-dashboard">
        <Dashboard onLogout={onLogout} />
      </div>

      <div className="activation-overlay">
        <div className="activation-card">
          <div className="lock-icon">🔒</div>

          <div className="activation-logo">
            <img src={logo} alt="Jirmas Signals" />
          </div>

          <h2>Activate Your Access</h2>

          <p className="activation-main">
            Get Lifetime Access to Jirmas Signals
          </p>

          <p className="activation-bengali">
            লাইফটাইম সাবস্ক্রিপশন নিতে আমাদের সাথে যোগাযোগ করুন।
          </p>

          <div className="lifetime-badge">
            ✓ One-time lifetime activation
          </div>

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="activation-button"
          >
            <TelegramIcon />
            Contact Us to Purchase Access
          </a>

          <a
            href={COMMUNITY_URL}
            target="_blank"
            rel="noreferrer"
            className="community-link"
          >
            Join Jirmas Trade Zone
          </a>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [accessActive, setAccessActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkAccess(userId) {
    const { data, error: accessError } = await supabase
      .from("user_access")
      .select("is_active")
      .eq("user_id", userId)
      .maybeSingle();

    if (accessError) {
      console.error("Access check error:", accessError);
      setAccessActive(false);
      return;
    }

    setAccessActive(data?.is_active === true);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        setError(sessionError.message);
      }

      const currentSession = data?.session ?? null;

      setSession(currentSession);

      if (currentSession?.user?.id) {
        await checkAccess(currentSession.user.id);
      }

      setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user?.id) {
          await checkAccess(newSession.user.id);
        } else {
          setAccessActive(false);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleGoogleLogin() {
    setError("");
    setLoginLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

    if (loginError) {
      setError(loginError.message);
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setAccessActive(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <img src={logo} alt="Jirmas Signals" />
        <div className="loading-spinner" />
        <span>Loading JIRMAS SIGNALS...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginPage
        onLogin={handleGoogleLogin}
        loading={loginLoading}
        error={error}
      />
    );
  }

  if (!accessActive) {
    return <ActivationScreen onLogout={handleLogout} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}