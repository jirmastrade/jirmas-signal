export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "https://jirmas-signal.vercel.app");

    const symbol = url.searchParams.get("symbol") || "EUR/USD";
    const interval = url.searchParams.get("interval") || "1min";
    const outputsize = url.searchParams.get("outputsize") || "100";

    const apiKey =
      process.env.VITE_TWELVE_DATA_API_KEY ||
      process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Twelve Data API key is not configured.",
      });
    }

    const apiUrl = new URL(
      "https://api.twelvedata.com/time_series"
    );

    apiUrl.searchParams.set("symbol", symbol);
    apiUrl.searchParams.set("interval", interval);
    apiUrl.searchParams.set("outputsize", outputsize);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `apikey ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === "error") {
      return res.status(502).json({
        success: false,
        error: data.message || "Twelve Data request failed.",
      });
    }

    return res.status(200).json({
      success: true,
      symbol: data.meta?.symbol || symbol,
      interval: data.meta?.interval || interval,
      values: data.values || [],
    });
  } catch (error) {
    console.error("Market API error:", error);

    return res.status(500).json({
      success: false,
      error: "Market API server error.",
    });
  }
}