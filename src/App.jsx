import { useEffect, useMemo, useState } from "react";
import logo from "./assets/IMG_5520.PNG";
import "./App.css";

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

/* =========================
   TRADINGVIEW
========================= */

function TradingViewChart({ symbol }) {
  useEffect(() => {
    const container = document.getElementById("tradingview_chart");

    if (!container) return;

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.width = "100%";
    widget.style.height = "100%";

    const script = document.createElement("script");

    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
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
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    wrapper.appendChild(widget);
    wrapper.appendChild(script);
    container.appendChild(wrapper);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol]);

  return <div id="tradingview_chart" className="chartMount" />;
}

/* =========================
   INDICATORS
========================= */

function ema(values, period) {
  if (values.length < period) return null;

  const multiplier = 2 / (period + 1);

  let result =
    values.slice(0, period).reduce((a, b) => a + b, 0) /
    period;

  for (let i = period; i < values.length; i++) {
    result =
      (values[i] - result) * multiplier + result;
  }

  return result;
}

function rsi(values, period = 14) {
  if (values.length <= period) return null;

  let gain = 0;
  let loss = 0;

  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];

    if (change > 0) gain += change;
    else loss += Math.abs(change);
  }

  let avgGain = gain / period;
  let avgLoss = loss / period;

  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];

    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain =
      (avgGain * (period - 1) + currentGain) / period;

    avgLoss =
      (avgLoss * (period - 1) + currentLoss) / period;
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;

  return 100 - 100 / (1 + rs);
}

function macd(values) {
  if (values.length < 40) return null;

  const list = [];

  for (let i = 26; i < values.length; i++) {
    const section = values.slice(0, i + 1);

    const e12 = ema(section, 12);
    const e26 = ema(section, 26);

    if (e12 !== null && e26 !== null) {
      list.push(e12 - e26);
    }
  }

  if (list.length < 9) return null;

  const value = list[list.length - 1];
  const signal = ema(list, 9);

  if (signal === null) return null;

  return {
    value,
    signal,
    histogram: value - signal,
  };
}

function stochastic(candles, period = 14) {
  if (candles.length < period) return null;

  const recent = candles.slice(-period);

  const high = Math.max(...recent.map((c) => c.high));
  const low = Math.min(...recent.map((c) => c.low));

  if (high === low) return 50;

  const close = recent[recent.length - 1].close;

  return ((close - low) / (high - low)) * 100;
}

function atr(candles, period = 14) {
  if (candles.length <= period) return null;

  const ranges = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previous = candles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    ranges.push(tr);
  }

  const recent = ranges.slice(-period);

  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

/* =========================
   SIGNAL ENGINE
========================= */

function analyze(candles) {
  if (candles.length < 60) {
    return {
      signal: "WAIT",
      confidence: 0,
      reason: "Collecting 1M data",
    };
  }

  // Use CLOSED candle only
  const closed = candles.slice(0, -1);

  const closes = closed.map((c) => c.close);

  const current = closed[closed.length - 1];
  const previous = closed[closed.length - 2];

  const EMA20 = ema(closes, 20);
  const EMA50 = ema(closes, 50);
  const RSI = rsi(closes, 14);
  const MACD = macd(closes);
  const STOCH = stochastic(closed, 14);
  const ATR = atr(closed, 14);

  if (
    EMA20 === null ||
    EMA50 === null ||
    RSI === null ||
    MACD === null ||
    STOCH === null ||
    ATR === null
  ) {
    return {
      signal: "WAIT",
      confidence: 0,
      reason: "Indicators loading",
    };
  }

  let buy = 0;
  let sell = 0;

  // EMA TREND
  if (EMA20 > EMA50) buy += 25;
  if (EMA20 < EMA50) sell += 25;

  // PRICE
  if (current.close > EMA20) buy += 15;
  if (current.close < EMA20) sell += 15;

  // RSI
  if (RSI >= 52 && RSI <= 68) buy += 15;
  if (RSI >= 32 && RSI <= 48) sell += 15;

  // MACD
  if (MACD.histogram > 0 && MACD.value > MACD.signal) {
    buy += 20;
  }

  if (MACD.histogram < 0 && MACD.value < MACD.signal) {
    sell += 20;
  }

  // STOCHASTIC
  if (STOCH >= 50 && STOCH <= 80) buy += 10;
  if (STOCH >= 20 && STOCH <= 50) sell += 10;

  // CANDLE DIRECTION
  if (current.close > previous.close) buy += 15;
  if (current.close < previous.close) sell += 15;

  // Avoid weak candles
  const body = Math.abs(current.close - current.open);
  const range = current.high - current.low;

  if (range > 0 && body / range < 0.35) {
    return {
      signal: "WAIT",
      confidence: 60,
      reason: "Weak candle",
      price: current.close,
      EMA20,
      EMA50,
      RSI,
      MACD,
      STOCH,
      ATR,
      candleTime: current.datetime,
    };
  }

  const strongest = Math.max(buy, sell);
  const difference = Math.abs(buy - sell);

  let signal = "WAIT";

  // STRICT FILTER
  if (
    buy >= 80 &&
    buy > sell &&
    difference >= 20
  ) {
    signal = "BUY";
  }

  if (
    sell >= 80 &&
    sell > buy &&
    difference >= 20
  ) {
    signal = "SELL";
  }

  let confidence = 0;

  if (signal === "WAIT") {
    confidence = Math.min(
      79,
      55 + Math.round(difference * 0.4)
    );
  } else {
    confidence = Math.min(
      96,
      Math.max(80, Math.round(strongest))
    );
  }

  return {
    signal,
    confidence,
    reason:
      signal === "WAIT"
        ? "No high-confidence setup"
        : "Strong multi-indicator confirmation",

    price: current.close,

    EMA20,
    EMA50,
    RSI,
    MACD,
    STOCH,
    ATR,

    candleTime: current.datetime,
  };
}

/* =========================
   QUOTEX UTC+6
========================= */

function parseUTC(datetime) {
  if (!datetime) return null;

  const value = datetime.includes("T")
    ? datetime
    : datetime.replace(" ", "T");

  const date = new Date(`${value}Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/*
  IMPORTANT:

  Quotex = UTC+6

  We do NOT use Riyadh time.
  We do NOT use browser local time.
  We manually add exactly 6 hours to UTC.
*/

function formatUTC6(datetime, extraMinutes = 0) {
  const date = parseUTC(datetime);

  if (!date) return "—";

  const utc6 = new Date(
    date.getTime() +
      6 * 60 * 60 * 1000 +
      extraMinutes * 60 * 1000
  );

  const hours = String(
    utc6.getUTCHours()
  ).padStart(2, "0");

  const minutes = String(
    utc6.getUTCMinutes()
  ).padStart(2, "0");

  const seconds = String(
    utc6.getUTCSeconds()
  ).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getEntryTime(datetime) {
  return formatUTC6(datetime, 1);
}

function getExpiryTime(datetime) {
  return formatUTC6(datetime, 2);
}

/* =========================
   PRICE
========================= */

function price(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  if (value >= 1000) return value.toFixed(2);
  if (value >= 10) return value.toFixed(3);

  return value.toFixed(5);
}

/* =========================
   APP
========================= */

function App() {
  const [category, setCategory] = useState("Forex");

  const [selectedMarket, setSelectedMarket] =
    useState(MARKETS.Forex[0]);

  const [candles, setCandles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [analysis, setAnalysis] = useState({
    signal: "WAIT",
    confidence: 0,
  });

  const markets = MARKETS[category];

  /* =========================
     FETCH 1M DATA
  ========================= */

  useEffect(() => {
    let stopped = false;

    async function loadData() {
      if (!API_KEY) {
        setError("Twelve Data API key missing.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const url =
          "https://api.twelvedata.com/time_series" +
          `?symbol=${encodeURIComponent(
            selectedMarket.api
          )}` +
          "&interval=1min" +
          "&outputsize=120" +
          "&timezone=UTC" +
          `&apikey=${API_KEY}`;

        const response = await fetch(url);

        const data = await response.json();

        if (data.status === "error") {
          throw new Error(
            data.message || "Market data unavailable"
          );
        }

        if (!data.values || data.values.length < 60) {
          throw new Error(
            "Not enough 1-minute market data"
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

        if (!stopped) {
          setCandles(parsed);
        }
      } catch (err) {
        if (!stopped) {
          setCandles([]);
          setError(
            err.message || "Market data error"
          );
        }
      } finally {
        if (!stopped) {
          setLoading(false);
        }
      }
    }

    loadData();

    const interval = setInterval(
      loadData,
      60 * 1000
    );

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [selectedMarket]);

  /* =========================
     ANALYSIS
  ========================= */

  useEffect(() => {
    if (!candles.length) {
      setAnalysis({
        signal: "WAIT",
        confidence: 0,
      });

      return;
    }

    setAnalysis(analyze(candles));
  }, [candles]);

  /* =========================
     SUPPORT / RESISTANCE
  ========================= */

  const levels = useMemo(() => {
    if (!candles.length) {
      return {
        support: null,
        resistance: null,
      };
    }

    const recent = candles.slice(-30);

    return {
      support: Math.min(
        ...recent.map((c) => c.low)
      ),

      resistance: Math.max(
        ...recent.map((c) => c.high)
      ),
    };
  }, [candles]);

  const signal = analysis.signal || "WAIT";

  const confidence = analysis.confidence || 0;

  return (
    <div className="app">

      {/* HEADER */}

      <header className="mobileHeader">

        <button className="headerButton">
          ☰
        </button>

        <div className="brand">

          <img
            src={logo}
            alt="JIRMAS"
          />

          <div>
            <h1>JIRMAS</h1>
            <span>1M SIGNALS</span>
          </div>

        </div>

        <div className="headerLive">
          <i />
          LIVE
        </div>

      </header>

      <main className="mainContent">

        {/* MARKET */}

        <section className="marketSection">

          <div className="marketTop">

            <div>
              <small>LIVE MARKET</small>

              <h2>
                {selectedMarket.name}
              </h2>
            </div>

            <strong>
              {loading
                ? "..."
                : price(analysis.price)}
            </strong>

          </div>

          <div className="categoryTabs">

            {Object.keys(MARKETS).map(
              (item) => (

                <button
                  key={item}
                  className={
                    category === item
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setCategory(item);
                    setSelectedMarket(
                      MARKETS[item][0]
                    );
                  }}
                >
                  {item}
                </button>

              )
            )}

          </div>

          <div className="marketScroll">

            {markets.map((market) => (

              <button
                key={market.tv}
                className={
                  selectedMarket.tv === market.tv
                    ? "marketChip active"
                    : "marketChip"
                }
                onClick={() =>
                  setSelectedMarket(market)
                }
              >

                <b>{market.name}</b>

                <span>
                  {selectedMarket.tv === market.tv
                    ? price(analysis.price)
                    : "—"}
                </span>

              </button>

            ))}

          </div>

        </section>

        {/* TRADINGVIEW */}

        <section className="chartCard">

          <div className="chartHeader">

            <div>
              <small>
                TRADINGVIEW • 1 MIN
              </small>

              <h2>
                {selectedMarket.name}
              </h2>
            </div>

            <div className="chartLive">
              <i />
              LIVE
            </div>

          </div>

          <div className="chartBox">

            <TradingViewChart
              symbol={selectedMarket.tv}
            />

          </div>

        </section>

        {/* SUPPORT / RESISTANCE */}

        <section className="levelBar">

          <div className="level support">

            <small>SUPPORT</small>

            <b>
              {price(levels.support)}
            </b>

          </div>

          <div className="levelMiddle">
            S/R
          </div>

          <div className="level resistance">

            <small>RESISTANCE</small>

            <b>
              {price(levels.resistance)}
            </b>

          </div>

        </section>

        {/* CONFIRMATION */}

        <section className="indicatorCard">

          <div className="indicatorHeader">

            <div>
              <small>
                1M TECHNICAL ANALYSIS
              </small>

              <h2>Confirmation</h2>
            </div>

            <span>
              ● ACTIVE
            </span>

          </div>

          <div className="indicatorScroll">

            <div className="indicator">
              <small>EMA 20</small>
              <b>
                {price(analysis.EMA20)}
              </b>
              <em>
                {analysis.EMA20 &&
                analysis.EMA50
                  ? analysis.EMA20 >
                    analysis.EMA50
                    ? "BULL"
                    : "BEAR"
                  : "WAIT"}
              </em>
            </div>

            <div className="indicator">
              <small>EMA 50</small>
              <b>
                {price(analysis.EMA50)}
              </b>
              <em>ACTIVE</em>
            </div>

            <div className="indicator">
              <small>RSI 14</small>
              <b>
                {analysis.RSI
                  ? analysis.RSI.toFixed(1)
                  : "—"}
              </b>
              <em>
                {analysis.RSI
                  ? analysis.RSI > 50
                    ? "BULL"
                    : "BEAR"
                  : "WAIT"}
              </em>
            </div>

            <div className="indicator">
              <small>MACD</small>
              <b>
                {analysis.MACD
                  ? analysis.MACD.histogram.toFixed(5)
                  : "—"}
              </b>
              <em>
                {analysis.MACD
                  ? analysis.MACD.histogram > 0
                    ? "BULL"
                    : "BEAR"
                  : "WAIT"}
              </em>
            </div>

            <div className="indicator">
              <small>STOCH</small>
              <b>
                {analysis.STOCH
                  ? analysis.STOCH.toFixed(1)
                  : "—"}
              </b>
              <em>ACTIVE</em>
            </div>

            <div className="indicator">
              <small>ATR</small>
              <b>
                {analysis.ATR
                  ? price(analysis.ATR)
                  : "—"}
              </b>
              <em>ACTIVE</em>
            </div>

          </div>

        </section>

        {/* SIGNAL */}

        <section
          className={`signalCard ${
            signal === "BUY"
              ? "buy"
              : signal === "SELL"
              ? "sell"
              : "wait"
          }`}
        >

          <div className="signalTop">

            <div>
              <small>
                JIRMAS 1M SIGNAL
              </small>

              <h2>{signal}</h2>
            </div>

            <div className="confidence">

              <small>
                CONFIDENCE
              </small>

              <strong>
                {confidence
                  ? `${confidence}%`
                  : "—"}
              </strong>

            </div>

          </div>

          {/* ENTRY TIME */}

          <div className="entryBox">

            <span>
              {signal === "WAIT"
                ? "WAIT FOR SIGNAL"
                : "ENTER AT"}
            </span>

            <strong>
              {signal === "WAIT"
                ? "WAIT"
                : getEntryTime(
                    analysis.candleTime
                  )}
            </strong>

            <small>
              QUOTEX UTC+6 • 1 MIN EXPIRY
            </small>

          </div>

          {/* DETAILS */}

          <div className="signalDetails">

            <div>
              <small>ENTRY PRICE</small>

              <b>
                {price(analysis.price)}
              </b>
            </div>

            <div>
              <small>EXPIRY</small>

              <b>
                {signal === "WAIT"
                  ? "—"
                  : getExpiryTime(
                      analysis.candleTime
                    )}
              </b>
            </div>

            <div>
              <small>TIMEFRAME</small>

              <b>1 MIN</b>
            </div>

          </div>

          <div className="signalMessage">

            {signal === "BUY" &&
              "BUY setup confirmed"}

            {signal === "SELL" &&
              "SELL setup confirmed"}

            {signal === "WAIT" &&
              "No high-confidence setup — WAIT"}

          </div>

          <div className="strictBadge">
            STRICT 80%+ FILTER
          </div>

        </section>

        {/* STATUS */}

        <section className="statusBar">

          <div>
            <small>MARKET</small>
            <b>{selectedMarket.name}</b>
          </div>

          <div>
            <small>DATA</small>
            <b className="green">
              {error
                ? "ERROR"
                : loading
                ? "UPDATING"
                : "LIVE"}
            </b>
          </div>

          <div>
            <small>MODE</small>
            <b>1M</b>
          </div>

        </section>

        {error && (
          <div className="errorBox">
            {error}
          </div>
        )}

      </main>

      {/* BOTTOM NAV */}

      <nav className="bottomNav">

        <button className="active">
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button>
          <span>▥</span>
          <small>Market</small>
        </button>

        <button className="signalNav">
          <span>〰</span>
          <small>Signals</small>
        </button>

        <button>
          <span>◷</span>
          <small>Analysis</small>
        </button>

        <button>
          <span>♙</span>
          <small>Profile</small>
        </button>

      </nav>

    </div>
  );
}

export default App;