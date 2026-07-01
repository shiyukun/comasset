const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputPath = process.argv[2] || path.join(root, "data", "live_macro.json");

const seriesConfig = {
  tenYearYield: "DGS10",
  fedFundsRate: "FEDFUNDS",
  cpi: "CPIAUCSL",
  pce: "PCEPI",
  unemployment: "UNRATE",
  vix: "VIXCLS",
  wtiOil: "DCOILWTICO",
  dollarIndex: "DTWEXBGS",
};

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  lines.shift();
  return lines
    .map((line) => {
      const [date, value] = line.split(",");
      return { date, value: !value || value === "." ? null : Number(value) };
    })
    .filter((point) => point.date && typeof point.value === "number" && !Number.isNaN(point.value));
}

async function fetchFredSeries(id) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(id)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "comasset-internal-research/0.1" },
  });
  if (!response.ok) throw new Error(`${id}: FRED request failed ${response.status}`);
  const observations = parseCsv(await response.text());
  if (!observations.length) throw new Error(`${id}: no observations`);
  return observations;
}

(async () => {
  const series = {};
  const errors = [];

  for (const [key, fredId] of Object.entries(seriesConfig)) {
    try {
      const observations = await fetchFredSeries(fredId);
      const recent = observations.slice(-260);
      series[key] = {
        fredId,
        latest: recent.at(-1),
        previous: recent.at(-2) || null,
        observations: recent,
      };
    } catch (error) {
      errors.push(`${key}/${fredId}: ${error.message}`);
    }
  }

  if (!Object.keys(series).length) {
    throw new Error(`No macro series fetched.\n${errors.join("\n")}`);
  }

  const asOf = Object.values(series)
    .map((item) => item.latest.date)
    .sort()
    .at(-1);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ asOf, source: "FRED fredgraph.csv", errors, series }, null, 2)}\n`
  );
  console.log(`Fetched ${Object.keys(series).length} macro series into ${path.relative(root, outputPath)}.`);
  if (errors.length) console.warn(errors.join("\n"));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
