const assert = require("assert");
const { runBacktest } = require("../web/backtest_engine.js");

const data = {
  asOf: "2026-02-02",
  currencies: {
    "D05.SI": "SGD",
    VTI: "USD",
    SPY: "USD",
    "SGDUSD=X": "USD",
  },
  prices: {
    SPY: [
      { date: "2026-01-02", close: 100 },
      { date: "2026-02-02", close: 102 },
    ],
    "D05.SI": [
      { date: "2026-01-02", close: 40 },
      { date: "2026-02-02", close: 44 },
    ],
    VTI: [{ date: "2026-02-02", close: 200 }],
    "SGDUSD=X": [
      { date: "2026-01-02", close: 0.75 },
      { date: "2026-02-02", close: 0.76 },
    ],
  },
  snapshots: [
    {
      snapshotId: "2026-W01-scored",
      generatedAt: "2026-01-01T12:00:00Z",
      recommendations: [{ ticker: "D05.SI", action: "buy", horizon: "ultra", score: 90 }],
    },
    {
      snapshotId: "2026-W02-scored",
      generatedAt: "2026-01-08T12:00:00Z",
      recommendations: [{ ticker: "VTI", action: "dca", horizon: "ultra", score: 92 }],
    },
  ],
};

const result = runBacktest(data, {
  strategy: "mixed",
  initialCapital: 10000,
  monthlyContribution: 500,
  rebalance: "monthly",
  topN: 5,
  slippage: 0,
});

assert.deepStrictEqual(result.sourceSnapshotIds, ["2026-W01-scored", "2026-W02-scored"]);
assert.ok(result.snapshotUsage.every((item) => item.noFutureDataRulePassed));
assert.strictEqual(result.rebalanceLog[0].tickers[0], "D05.SI");
assert.strictEqual(result.rebalanceLog[1].tickers[0], "VTI");
assert.strictEqual(result.trades.find((trade) => trade.ticker === "D05.SI" && trade.side === "buy").fxToUsd, 0.75);
assert.strictEqual(result.summary.investedCapital, 10500);
assert.ok(result.summary.finalValue > 10500);

console.log("backtest_engine.test.js passed");
