export default async function handler(req, res) {
  try {
    const { symbol = "EUR/USD", interval = "1min", outputsize = "100" } =
      req.query;

    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Market data service is not configured.",
      });
    }

    const url = new URL("https://api.twelvedata.com/time_series");

    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("outputsize", outputsize);

    const response = await fetch(url, {
      headers: {
        Authorization: `apikey ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === "error") {
      return res.status(response.status || 502).json({
        success: false,
        error: data.message || "Unable to fetch market data.",
      });
    }

    return res.status(200).json({
      success: true,
      symbol: data.meta?.symbol || symbol,
      interval: data.meta?.interval || interval,
      timezone: data.meta?.timezone || null,
      values: data.values || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Market data request failed.",
    });
  }
}