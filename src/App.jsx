import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import "./App.css";

const TELEGRAM_CHANNEL = "https://t.me/jirmastradezone";
const TELEGRAM_SUPPORT = "https://t.me/Jirmas_Trader";

const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;

const MARKETS = {
  Forex: [
    { name: "EUR/USD", tv: "OANDA:EURUSD", api: "EUR/USD" },
    { name: "GBP/USD", tv: "OANDA:GBPUSD", api: "GBP/USD" },
    { name: "USD/JPY", tv: "OANDA:USDJPY", api: "USD/JPY" },
    { name: "USD/CHF", tv: "OANDA:USDCHF", api: "USD/CHF" },
    { name: "AUD/USD", tv: "OANDA:AUDUSD", api: "AUD/USD" },
    { name: "USD/CAD", tv: "OANDA:USDCAD", api: "USD/CAD" },
    { name: "NZD/USD", tv: "OANDA:NZDUSD", api: "NZD/USD" },
  ],
  Gold: [
    { name: "XAU/USD", tv: "OANDA:XAUUSD", api: "XAU/USD" },
  ],
  Crypto: [
    { name: "BTC/USD", tv: "OANDA:BTCUSD", api: "BTC/USD" },
    { name: "ETH/USD", tv: "OANDA:ETHUSD", api: "ETH/USD" },
  ],
  Indices: [
    { name: "US30", tv: "OANDA:US30USD", api: "DJI" },
    { name: "NAS100", tv: "OANDA:NAS100USD", api: "IXIC" },
    { name: "SPX500", tv: "OANDA:SPX500USD", api: "SPX" },
  ],
};

const CATEGORIES = Object.keys(MARKETS);

function parseUTC(value) {
  if (!value) return null;

  const normalized = value.includes("T")
    ? value
    : value.replace(" ", "T");

  const date = new Date(`${normalized}Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatUTC6(value, extraMinutes = 0) {
  const date = parseUTC(value);

  if (!date) return "—";

  const utc6 = new Date(
    date.getTime() +
      6 * 60 * 60 * 1000 +
      extraMinutes * 60 * 1000
  );

  const hours = String(utc6.getUTCHours()).padStart(2, "0");
  const minutes = String(utc6.getUTCMinutes()).padStart(2, "0");
  const seconds = String(utc6.getUTCSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getEntryTime(value) {
  return formatUTC6(value, 1);
}

function getExpiryTime(value) {
  return formatUTC6(value, 2);
}

function ema(values, period) {
  if (!values.length) return [];

  const result = new Array(values.length).fill(null);

  if (values.length < period) return result;

  let sum = 0;

  for (let i = 0; i < period; i += 1) {
    sum += values[i];
  }

  result[period - 1] = sum / period;

  const multiplier = 2 / (period + 1);

  for (let i = period; i < values.length; i += 1) {
    result[i] =
      (values[i] - result[i - 1]) * multiplier + result[i - 1];
  }

  return result;
}

function rsi(values, period = 14) {
  const result = new Array(values.length).fill(null);

  if (values.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const change = values[i] - values[i - 1];

    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  result[period] =
    averageLoss === 0
      ? 100
      : 100 - 100 / (1 + averageGain / averageLoss);

  for (let i = period + 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];

    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    averageGain =
      (averageGain * (period - 1) + gain) / period;

    averageLoss =
      (averageLoss * (period - 1) + loss) / period;

    result[i] =
      averageLoss === 0
        ? 100
        : 100 - 100 / (1 + averageGain / averageLoss);
  }

  return result;
}

function sma(values, period) {
  const result = new Array(values.length).fill(null);

  if (values.length < period) return result;

  let sum = 0;

  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];

    if (i >= period) {
      sum -= values[i - period];
    }

    if (i >= period - 1) {
      result[i] = sum / period;
    }
  }

  return result;
}

function stochastic(highs, lows, closes, period = 14) {
  const result = new Array(closes.length).fill(null);

  for (let i = period - 1; i < closes.length; i += 1) {
    let highest = -Infinity;
    let lowest = Infinity;

    for (let j = i - period + 1; j <= i; j += 1) {
      highest = Math.max(highest, highs[j]);
      lowest = Math.min(lowest, lows[j]);
    }

    const range = highest - lowest;

    result[i] =
      range === 0
        ? 50
        : ((closes[i] - lowest) / range) * 100;
  }

  return result;
}

function atr(highs, lows, closes, period = 14) {
  const tr = new Array(closes.length).fill(null);
  const result = new Array(closes.length).fill(null);

  if (!closes.length) return result;

  tr[0] = highs[0] - lows[0];

  for (let i = 1; i < closes.length; i += 1) {
    tr[i] = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
  }

  const first = sma(tr, period);

  for (let i = 0; i < closes.length; i += 1) {
    result[i] = first[i];
  }

  for (let i = period; i < closes.length; i += 1) {
    if (result[i - 1] !== null) {
      result[i] =
        (result[i - 1] * (period - 1) + tr[i]) / period;
    }
  }

  return result;
}

function calculateIndicators(candles) {
  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);

  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);

  const rsi14 = rsi(closes, 14);

  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);

  const macdLine = closes.map((_, i) => {
    if (ema12[i] === null || ema26[i] === null) return null;
    return ema12[i] - ema26[i];
  });

  const validMacd = macdLine.filter((v) => v !== null);
  const signalRaw = ema(validMacd, 9);

  const macdSignal = new Array(closes.length).fill(null);

  let signalIndex = 0;

  for (let i = 0; i < macdLine.length; i += 1) {
    if (macdLine[i] !== null) {
      macdSignal[i] = signalRaw[signalIndex];
      signalIndex += 1;
    }
  }

  const stoch14 = stochastic(
    highs,
    lows,
    closes,
    14
  );

  const atr14 = atr(
    highs,
    lows,
    closes,
    14
  );

  const last = closes.length - 1;

  return {
    ema20: ema20[last],
    ema50: ema50[last],
    rsi: rsi14[last],
    macd: macdLine[last],
    macdSignal: macdSignal[last],
    stochastic: stoch14[last],
    atr: atr14[last],
  };
}

function calculateZones(candles) {
  if (candles.length < 20) {
    return {
      support: null,
      resistance: null,
    };
  }

  const recent = candles.slice(-40);

  const support = Math.min(
    ...recent.map((c) => c.low)
  );

  const resistance = Math.max(
    ...recent.map((c) => c.high)
  );

  return {
    support,
    resistance,
  };
}

function calculateSignal(candles) {
  if (candles.length < 60) {
    return {
      signal: "WAIT",
      confidence: 0,
      reason: "Waiting for enough market data.",
      indicators: {},
      zones: {},
      entryPrice: null,
      candleTime: null,
    };
  }

  const closed = candles.slice(0, -1);

  const last = closed[closed.length - 1];
  const previous = closed[closed.length - 2];

  const indicators = calculateIndicators(closed);
  const zones = calculateZones(closed);

  let buy = 0;
  let sell = 0;

  const reasons = [];

  if (
    indicators.ema20 !== null &&
    indicators.ema50 !== null
  ) {
    if (indicators.ema20 > indicators.ema50) {
      buy += 25;
      reasons.push("EMA bullish");
    }

    if (indicators.ema20 < indicators.ema50) {
      sell += 25;
      reasons.push("EMA bearish");
    }
  }

  if (indicators.rsi !== null) {
    if (
      indicators.rsi >= 52 &&
      indicators.rsi <= 72
    ) {
      buy += 20;
      reasons.push("RSI supports BUY");
    }

    if (
      indicators.rsi <= 48 &&
      indicators.rsi >= 28
    ) {
      sell += 20;
      reasons.push("RSI supports SELL");
    }
  }

  if (
    indicators.macd !== null &&
    indicators.macdSignal !== null
  ) {
    if (indicators.macd > indicators.macdSignal) {
      buy += 20;
      reasons.push("MACD bullish");
    }

    if (indicators.macd < indicators.macdSignal) {
      sell += 20;
      reasons.push("MACD bearish");
    }
  }

  if (indicators.stochastic !== null) {
    if (
      indicators.stochastic > 55 &&
      indicators.stochastic < 90
    ) {
      buy += 15;
    }

    if (
      indicators.stochastic < 45 &&
      indicators.stochastic > 10
    ) {
      sell += 15;
    }
  }

  const candleBody = Math.abs(last.close - last.open);
  const candleRange = last.high - last.low;

  const bodyStrength =
    candleRange > 0
      ? candleBody / candleRange
      : 0;

  const bullishCandle =
    last.close > last.open;

  const bearishCandle =
    last.close < last.open;

  if (bodyStrength >= 0.45) {
    if (bullishCandle) buy += 20;
    if (bearishCandle) sell += 20;
  }

  let signal = "WAIT";
  let confidence = Math.max(buy, sell);

  if (
    bullishCandle &&
    buy >= 80 &&
    buy > sell &&
    buy - sell >= 20 &&
    bodyStrength >= 0.45
  ) {
    signal = "BUY";
  } else if (
    bearishCandle &&
    sell >= 80 &&
    sell > buy &&
    sell - buy >= 20 &&
    bodyStrength >= 0.45
  ) {
    signal = "SELL";
  } else {
    confidence = Math.max(buy, sell);
  }

  let reason = "No high-confidence setup — WAIT";

  if (signal === "BUY") {
    reason = "Strong bullish setup detected.";
  }

  if (signal === "SELL") {
    reason = "Strong bearish setup detected.";
  }

  return {
    signal,
    confidence,
    reason,
    indicators,
    zones,
    entryPrice: last.close,
    candleTime: last.datetime,
    buyScore: buy,
    sellScore: sell,
    previous,
  };
}

function formatPrice(price) {
  if (price === null || price === undefined) return "—";

  if (price >= 1000) return price.toFixed(2);
  if (price >= 100) return price.toFixed(3);
  if (price >= 10) return price.toFixed(4);
  return price.toFixed(5);
}

function formatIndicator(value, digits = 2) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(digits);
}

function SignalIcon({ signal }) {
  if (signal === "BUY") return <span>↗️</span>;
  if (signal === "SELL") return <span>↘️</span>;
  return <span>•</span>;
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem("jirmas_access") === "active";
  });

  const [accessCode, setAccessCode] = useState("");
  const [accessMessage, setAccessMessage] = useState("");

  const [category, setCategory] = useState("Forex");
  const [selectedMarket, setSelectedMarket] = useState(
    MARKETS.Forex[0]
  );

  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const [activeTab, setActiveTab] = useState("Signals");

  const chartRef = useRef(null);

  const allMarkets = useMemo(
    () => MARKETS[category] || [],
    [category]
  );

  const analysis = useMemo(
    () => calculateSignal(candles),
    [candles]
  );

  const fetchMarketData = useCallback(async () => {
    if (!API_KEY) {
      setDataError(
        "Twelve Data API key is missing. Add VITE_TWELVE_DATA_API_KEY in Vercel."
      );
      return;
    }

    setLoading(true);
    setDataError("");

    try {
      const url =
        "https://api.twelvedata.com/time_series" +
        `?symbol=${encodeURIComponent(selectedMarket.api)}` +
        "&interval=1min" +
        "&outputsize=120" +
        "&timezone=UTC" +
        `&apikey=${encodeURIComponent(API_KEY)}`;

      const response = await fetch(url);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `HTTP ${response.status}`
        );
      }

      if (
        data.status === "error" ||
        data.code
      ) {
        throw new Error(
          data.message ||
            "Twelve Data rejected the API request."
        );
      }

      if (!Array.isArray(data.values)) {
        throw new Error(
          "No candle data was returned."
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
        .filter(
          (item) =>
            Number.isFinite(item.open) &&
            Number.isFinite(item.high) &&
            Number.isFinite(item.low) &&
            Number.isFinite(item.close)
        )
        .reverse();

      if (!parsed.length) {
        throw new Error(
          "Twelve Data returned an empty dataset."
        );
      }

      setCandles(parsed);
    } catch (error) {
      console.error(error);

      setDataError(
        error?.message ||
          "Unable to load market data."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedMarket]);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data.session);
          setAuthLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setAuthLoading(false);
      });

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !hasAccess) return;

    fetchMarketData();

    const timer = setInterval(
      fetchMarketData,
      60000
    );

    return () => clearInterval(timer);
  }, [
    session,
    hasAccess,
    fetchMarketData,
  ]);

  useEffect(() => {
    if (!hasAccess) return;

    const script = document.createElement("script");

    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: selectedMarket.tv,
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: true,
      support_host:
        "https://www.tradingview.com",
    });

    if (chartRef.current) {
      chartRef.current.innerHTML = "";
      chartRef.current.appendChild(script);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = "";
      }
    };
  }, [selectedMarket, hasAccess]);

  async function loginWithGoogle() {
    setAuthLoading(true);

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

    if (error) {
      console.error(error);
      setAuthLoading(false);
      alert(
        error.message ||
          "Google login could not be started."
      );
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    localStorage.removeItem(
      "jirmas_access"
    );

    setHasAccess(false);
  }

  function handleActivate() {
    setAccessMessage("");

    const code = accessCode
      .trim()
      .toUpperCase();

    if (!code) {
      setAccessMessage(
        "Please enter your access code."
      );
      return;
    }

    /*
      IMPORTANT:
      This temporary UI accepts an access code
      only after it is connected to the secure
      Supabase access_codes table.

      We intentionally do NOT put a universal
      master code inside browser JavaScript.
    */

    setAccessMessage(
      "Your code has been submitted. Please contact Telegram Support to verify and activate your lifetime access."
    );
  }

  function openTelegram(url) {
    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function changeCategory(nextCategory) {
    setCategory(nextCategory);

    const firstMarket =
      MARKETS[nextCategory]?.[0];

    if (firstMarket) {
      setSelectedMarket(firstMarket);
    }
  }

  function changeMarket(market) {
    setSelectedMarket(market);
  }

  if (authLoading) {
    return (
      <div className="boot-screen">
        <div className="boot-logo">
          JS
        </div>

        <h1>JIRMAS SIGNALS</h1>

        <p>
          Initializing secure trading terminal...
        </p>

        <div className="loader" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-page">
        <div className="auth-glow glow-one" />
        <div className="auth-glow glow-two" />

        <main className="auth-card">
          <div className="brand-mark">
            JS
          </div>

          <div className="brand-title">
            JIRMAS
            <span>SIGNALS</span>
          </div>

          <p className="brand-subtitle">
            PROFESSIONAL 1 MIN MARKET SIGNALS
          </p>

          <div className="auth-divider">
            <span />
            <b>SECURE ACCESS</b>
            <span />
          </div>

          <button
            className="google-button"
            onClick={loginWithGoogle}
          >
            <span className="google-icon">
              G
            </span>

            <span>
              Continue with Google
            </span>

            <span className="button-arrow">
              →
            </span>
          </button>

          <div className="community-card">
            <div className="community-icon">
              ◈
            </div>

            <div>
              <strong>
                Join Our Community
              </strong>

              <p>
                Get updates, announcements and
                trading information.
              </p>
            </div>

            <button
              onClick={() =>
                openTelegram(
                  TELEGRAM_CHANNEL
                )
              }
            >
              JOIN
            </button>
          </div>

          <div className="support-card">
            <div className="support-icon">
              ?
            </div>

            <div>
              <strong>
                Need Support?
              </strong>

              <p>
                Contact our Telegram support.
              </p>
            </div>

            <button
              onClick={() =>
                openTelegram(
                  TELEGRAM_SUPPORT
                )
              }
            >
              SUPPORT
            </button>
          </div>

          <div className="auth-footer">
            <span>● SECURE</span>
            <span>● MOBILE READY</span>
            <span>● 1 MIN</span>
          </div>
        </main>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="access-page">
        <header className="simple-header">
          <div className="mini-brand">
            <div className="mini-mark">
              JS
            </div>

            <div>
              <strong>
                JIRMAS
              </strong>

              <span>
                SIGNALS
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </header>

        <main className="access-main">
          <div className="access-badge">
            PRIVATE MEMBERS AREA
          </div>

          <h1>
            Activate Your
            <span> Lifetime Access</span>
          </h1>

          <p className="access-description">
            Contact our Telegram Support to
            receive your access code after your
            payment has been confirmed.
          </p>

          <div className="activate-card">
            <div className="lock-circle">
              🔐
            </div>

            <h2>
              ACTIVATE ACCESS
            </h2>

            <p>
              Enter the access code provided by
              JIRMAS Support.
            </p>

            <input
              type="text"
              value={accessCode}
              onChange={(event) =>
                setAccessCode(
                  event.target.value
                )
              }
              placeholder="ENTER ACCESS CODE"
              autoCapitalize="characters"
              spellCheck="false"
            />

            <button
              className="activate-button"
              onClick={handleActivate}
            >
              ACTIVATE ACCESS
              <span>→</span>
            </button>

            {accessMessage && (
              <div className="access-message">
                {accessMessage}
              </div>
            )}

            <div className="access-help">
              <span>Don't have a code?</span>

              <button
                onClick={() =>
                  openTelegram(
                    TELEGRAM_SUPPORT
                  )
                }
              >
                Contact @Jirmas_Trader
              </button>
            </div>
          </div>

          <div className="telegram-options">
            <button
              onClick={() =>
                openTelegram(
                  TELEGRAM_SUPPORT
                )
              }
            >
              <span>💬</span>

              <div>
                <strong>
                  Telegram Support
                </strong>

                <small>
                  @Jirmas_Trader
                </small>
              </div>

              <b>→</b>
            </button>

            <button
              onClick={() =>
                openTelegram(
                  TELEGRAM_CHANNEL
                )
              }
            >
              <span>📢</span>

              <div>
                <strong>
                  Join Our Community
                </strong>

                <small>
                  JIRMAS Trade Zone
                </small>
              </div>

              <b>→</b>
            </button>
          </div>

          <div className="access-note">
            ♾️ Lifetime access after successful
            activation
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="header-brand">
          <div className="header-mark">
            JS
          </div>

          <div>
            <strong>
              JIRMAS
            </strong>

            <span>
              SIGNALS
            </span>
          </div>
        </div>

        <div className="header-status">
          <span className="live-dot" />
          LIVE
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">
              MARKET INTELLIGENCE
            </p>

            <h1>
              Signal Terminal
            </h1>
          </div>

          <button
            className="profile-button"
            onClick={logout}
            title="Logout"
          >
            {session?.user?.email
              ?.slice(0, 1)
              ?.toUpperCase() || "U"}
          </button>
        </section>

        <section className="category-scroll">
          {CATEGORIES.map(
            (item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "category active"
                    : "category"
                }
                onClick={() =>
                  changeCategory(item)
                }
              >
                {item}
              </button>
            )
          )}
        </section>

        <section className="market-scroll">
          {allMarkets.map(
            (market) => (
              <button
                key={market.name}
                className={
                  selectedMarket.name ===
                  market.name
                    ? "market-chip selected"
                    : "market-chip"
                }
                onClick={() =>
                  changeMarket(market)
                }
              >
                <span className="market-dot" />
                {market.name}
              </button>
            )
          )}
        </section>

        <section className="chart-card">
          <div className="section-heading">
            <div>
              <span className="small-label">
                LIVE MARKET
              </span>

              <h2>
                {selectedMarket.name}
              </h2>
            </div>

            <div className="chart-timeframe">
              1 MIN
            </div>
          </div>

          <div
            className="tradingview-container"
            ref={chartRef}
          />
        </section>

        <section className="signal-card">
          <div className="signal-top">
            <div>
              <span className="signal-label">
                JIRMAS 1M SIGNAL
              </span>

              <div
                className={`signal-value ${analysis.signal.toLowerCase()}`}
              >
                <SignalIcon
                  signal={
                    analysis.signal
                  }
                />

                {analysis.signal}
              </div>
            </div>

            <div className="confidence">
              <span>
                CONFIDENCE
              </span>

              <strong>
                {analysis.confidence}%
              </strong>
            </div>
          </div>

          <div className="signal-line">
            <span />

            <b>
              QUOTEX UTC+6 • 1 MIN EXPIRY
            </b>

            <span />
          </div>

          <div className="trade-grid">
            <div className="trade-box">
              <span>
                ENTRY PRICE
              </span>

              <strong>
                {formatPrice(
                  analysis.entryPrice
                )}
              </strong>
            </div>

            <div className="trade-box">
              <span>
                ENTER AT
              </span>

              <strong>
                {analysis.candleTime
                  ? getEntryTime(
                      analysis.candleTime
                    )
                  : "—"}
              </strong>
            </div>

            <div className="trade-box">
              <span>
                EXPIRY
              </span>

              <strong>
                {analysis.candleTime
                  ? getExpiryTime(
                      analysis.candleTime
                    )
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="signal-reason">
            {analysis.reason}
          </div>

          <div className="strict-filter">
            STRICT 80%+ FILTER
          </div>
        </section>

        <section className="status-card">
          <div>
            <span>
              MARKET
            </span>

            <strong>
              {selectedMarket.name}
            </strong>
          </div>

          <div>
            <span>
              DATA
            </span>

            <strong
              className={
                dataError
                  ? "error-text"
                  : "success-text"
              }
            >
              {loading
                ? "LOADING"
                : dataError
                ? "ERROR"
                : "LIVE"}
            </strong>
          </div>

          <div>
            <span>
              MODE
            </span>

            <strong>
              1M
            </strong>
          </div>
        </section>

        {dataError && (
          <section className="error-card">
            <div className="error-icon">
              !
            </div>

            <div>
              <strong>
                MARKET DATA ERROR
              </strong>

              <p>
                {dataError}
              </p>

              <button
                onClick={
                  fetchMarketData
                }
              >
                RETRY DATA
              </button>
            </div>
          </section>
        )}

        <section className="indicator-section">
          <div className="section-title-row">
            <div>
              <span className="small-label">
                TECHNICAL ENGINE
              </span>

              <h2>
                Indicators
              </h2>
            </div>
          </div>

          <div className="indicator-scroll">
            <div className="indicator-card">
              <span>
                EMA 20
              </span>

              <strong>
                {formatIndicator(
                  analysis.indicators
                    .ema20,
                  5
                )}
              </strong>

              <small>
                Trend
              </small>
            </div>

            <div className="indicator-card">
              <span>
                EMA 50
              </span>

              <strong>
                {formatIndicator(
                  analysis.indicators
                    .ema50,
                  5
                )}
              </strong>

              <small>
                Trend
              </small>
            </div>

            <div className="indicator-card">
              <span>
                RSI 14
              </span>

              <strong>
                {formatIndicator(
                  analysis.indicators
                    .rsi
                )}
              </strong>

              <small>
                Momentum
              </small>
            </div>

            <div className="indicator-card">
              <span>
                MACD
              </span>

              <strong>
                {formatIndicator(
                  analysis.indicators
                    .macd,
                  5
                )}
              </strong>

              <small>
                Momentum
              </small>
            </div>

            <div className="indicator-card">
              <span>
                STOCH
              </span>

              <strong>
                {formatIndicator(
                  analysis.indicators
                    .stochastic
                )}
              </strong>

              <small>
                Oscillator
              </small>
            </div>

            <div className="indicator-card">
              <span>
                ATR 14
              </span>

              <strong>
                {formatIndicator(
                  analysis.indicators
                    .atr,
                  5
                )}
              </strong>

              <small>
                Volatility
              </small>
            </div>
          </div>
        </section>

        <section className="zones-card">
          <div className="section-title-row">
            <div>
              <span className="small-label">
                PRICE LEVELS
              </span>

              <h2>
                Support & Resistance
              </h2>
            </div>
          </div>

          <div className="zone-grid">
            <div className="zone support">
              <span>
                SUPPORT
              </span>

              <strong>
                {formatPrice(
                  analysis.zones.support
                )}
              </strong>
            </div>

            <div className="zone resistance">
              <span>
                RESISTANCE
              </span>

              <strong>
                {formatPrice(
                  analysis.zones.resistance
                )}
              </strong>
            </div>
          </div>
        </section>

        <section className="terminal-note">
          <div className="note-icon">
            i
          </div>

          <p>
            Signals are generated from technical
            conditions and market data. WAIT means
            no high-confidence setup is currently
            detected.
          </p>
        </section>
      </main>

      <nav className="bottom-nav">
        <button
          className={
            activeTab === "Home"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActiveTab("Home")
          }
        >
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button
          className={
            activeTab === "Market"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActiveTab("Market")
          }
        >
          <span>▦</span>
          <small>Market</small>
        </button>

        <button
          className={
            activeTab === "Signals"
              ? "nav-item active signal-nav"
              : "nav-item signal-nav"
          }
          onClick={() =>
            setActiveTab("Signals")
          }
        >
          <span>〽</span>
          <small>Signals</small>
        </button>

        <button
          className={
            activeTab === "Analysis"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActiveTab("Analysis")
          }
        >
          <span>◔</span>
          <small>Analysis</small>
        </button>
      </nav>
    </div>
  );
}

export default App;