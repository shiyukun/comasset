(function (root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  else root.ComassetBacktest = engine;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ENGINE_VERSION = "snapshot-backtest-v1.0";

  function clampNumber(value, fallback, min = -Infinity, max = Infinity) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  }

  function stdev(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  function latestPoint(series, date) {
    if (!Array.isArray(series)) return null;
    for (let index = series.length - 1; index >= 0; index -= 1) {
      if (series[index].date <= date && Number(series[index].close) > 0) return series[index];
    }
    return null;
  }

  function datePart(value) {
    return String(value || "").slice(0, 10);
  }

  function monthKey(date) {
    return date.slice(0, 7);
  }

  function quarterKey(date) {
    const month = Number(date.slice(5, 7));
    return `${date.slice(0, 4)}-Q${Math.ceil(month / 3)}`;
  }

  function latestEligibleSnapshot(snapshots, tradeDate) {
    return snapshots
      .filter((snapshot) => datePart(snapshot.generatedAt) < tradeDate)
      .sort((a, b) => String(a.generatedAt).localeCompare(String(b.generatedAt)))
      .at(-1);
  }

  function selectedTickers(snapshot, strategy, topN) {
    if (strategy === "benchmark") return ["SPY"];
    if (strategy === "qqq") return ["QQQ"];
    if (strategy === "cash") return ["CASH"];
    return (snapshot?.recommendations || [])
      .filter((item) => ["buy", "dca"].includes(item.action))
      .filter((item) => strategy !== "ultra" || item.horizon === "ultra")
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map((item) => item.ticker);
  }

  function currencyFor(data, ticker) {
    if (ticker === "SGDUSD=X") return "USD";
    return data.currencies?.[ticker] || "USD";
  }

  function fxRate(data, currency, date) {
    if (currency === "USD") return 1;
    if (currency === "SGD") return latestPoint(data.prices?.["SGDUSD=X"], date)?.close || null;
    return null;
  }

  function usdPrice(data, ticker, date) {
    const point = latestPoint(data.prices?.[ticker], date);
    if (!point) return null;
    const currency = currencyFor(data, ticker);
    const fx = fxRate(data, currency, date);
    if (!fx) return null;
    return {
      date: point.date,
      nativePrice: Number(point.close),
      currency,
      fxToUsd: Number(fx),
      usdPrice: Number(point.close) * Number(fx),
    };
  }

  function portfolioValue(data, holdings, cash, date) {
    let value = cash;
    const missing = [];
    Object.entries(holdings).forEach(([ticker, shares]) => {
      const price = usdPrice(data, ticker, date);
      if (!price) missing.push(ticker);
      else value += shares * price.usdPrice;
    });
    return { value, missing };
  }

  function shouldRebalance(date, previousDate, cadence) {
    if (!previousDate) return true;
    if (cadence === "quarterly") return quarterKey(date) !== quarterKey(previousDate);
    return monthKey(date) !== monthKey(previousDate);
  }

  function maxDrawdown(curve) {
    let peak = -Infinity;
    let peakDate = null;
    let result = { value: 0, start: null, end: null };
    curve.forEach((point) => {
      if (point.value > peak) {
        peak = point.value;
        peakDate = point.date;
      }
      const drawdown = peak > 0 ? point.value / peak - 1 : 0;
      if (drawdown < result.value) result = { value: drawdown, start: peakDate, end: point.date };
    });
    return result;
  }

  function monthlyRows(curve, periodReturns) {
    const byMonth = new Map();
    curve.forEach((point, index) => {
      const key = monthKey(point.date);
      const current = byMonth.get(key) || { month: key, return: 1, value: point.value };
      current.return *= 1 + (periodReturns[index] || 0);
      current.value = point.value;
      byMonth.set(key, current);
    });
    return [...byMonth.values()].map((row) => ({ ...row, return: row.return - 1 }));
  }

  function runBacktest(data, options = {}) {
    const snapshots = [...(data.snapshots || [])].sort((a, b) =>
      String(a.generatedAt).localeCompare(String(b.generatedAt))
    );
    if (!snapshots.length) throw new Error("No historical snapshots available.");
    if (!data.prices?.SPY?.length) throw new Error("SPY price history is required as the reference calendar.");

    const strategy = options.strategy || "mixed";
    const initialCapital = clampNumber(options.initialCapital, 10000, 1);
    const monthlyContribution = clampNumber(options.monthlyContribution, 0, 0);
    const rebalance = options.rebalance === "quarterly" ? "quarterly" : "monthly";
    const topN = Math.round(clampNumber(options.topN, 5, 1, 20));
    const slippage = clampNumber(options.slippage, 0.0005, 0, 0.05);
    const startAfter = datePart(snapshots[0].generatedAt);
    const endDate = options.endDate || data.asOf || data.prices.SPY.at(-1).date;
    const dates = data.prices.SPY.map((point) => point.date).filter((date) => date > startAfter && date <= endDate);
    if (!dates.length) throw new Error("No price dates exist after the earliest snapshot generation time.");

    let cash = initialCapital;
    let investedCapital = initialCapital;
    let holdings = {};
    let previousDate = null;
    let previousValue = initialCapital;
    let previousMonth = null;
    const curve = [];
    const periodReturns = [];
    const trades = [];
    const rebalanceLog = [];
    const snapshotUsage = [];
    const warnings = [];

    dates.forEach((date) => {
      let contribution = 0;
      if (previousMonth && monthKey(date) !== previousMonth && monthlyContribution > 0) {
        contribution = monthlyContribution;
        cash += contribution;
        investedCapital += contribution;
      }

      if (shouldRebalance(date, previousDate, rebalance)) {
        const snapshot = latestEligibleSnapshot(snapshots, date);
        const tickers = selectedTickers(snapshot, strategy, topN);
        const before = portfolioValue(data, holdings, cash, date);
        if (before.missing.length) warnings.push(`${date}: missing valuation price for ${before.missing.join(", ")}`);

        Object.entries(holdings).forEach(([ticker, shares]) => {
          const price = usdPrice(data, ticker, date);
          if (!price) return;
          const gross = shares * price.usdPrice;
          const net = gross * (1 - slippage);
          cash += net;
          trades.push({
            date,
            side: "sell",
            ticker,
            shares,
            nativePrice: price.nativePrice,
            currency: price.currency,
            fxToUsd: price.fxToUsd,
            grossValueUsd: gross,
            slippageUsd: gross - net,
            snapshotId: snapshot?.snapshotId || null,
          });
        });
        holdings = {};

        const tradable = tickers
          .map((ticker) => ({ ticker, price: usdPrice(data, ticker, date) }))
          .filter((item) => {
            if (!item.price) warnings.push(`${date}: skipped ${item.ticker}, missing price or FX rate`);
            return Boolean(item.price);
          });
        const targetValue = tradable.length ? cash / tradable.length : 0;
        tradable.forEach(({ ticker, price }) => {
          const spend = targetValue * (1 - slippage);
          const shares = spend / price.usdPrice;
          holdings[ticker] = shares;
          cash -= targetValue;
          trades.push({
            date,
            side: "buy",
            ticker,
            shares,
            nativePrice: price.nativePrice,
            currency: price.currency,
            fxToUsd: price.fxToUsd,
            grossValueUsd: targetValue,
            slippageUsd: targetValue - spend,
            snapshotId: snapshot?.snapshotId || null,
          });
        });

        rebalanceLog.push({
          date,
          snapshotId: snapshot?.snapshotId || null,
          snapshotGeneratedAt: snapshot?.generatedAt || null,
          tickers: tradable.map((item) => item.ticker),
          contribution,
          status: snapshot && tradable.length ? "executed" : "cash_only",
        });
        if (snapshot) {
          snapshotUsage.push({
            snapshotId: snapshot.snapshotId,
            generatedAt: snapshot.generatedAt,
            tradeDate: date,
            noFutureDataRulePassed: datePart(snapshot.generatedAt) < date,
          });
        }
      }

      const valuation = portfolioValue(data, holdings, cash, date);
      if (valuation.missing.length) warnings.push(`${date}: missing close for ${valuation.missing.join(", ")}`);
      const periodReturn = previousValue > 0 ? (valuation.value - contribution) / previousValue - 1 : 0;
      periodReturns.push(periodReturn);
      curve.push({
        date,
        value: valuation.value,
        investedCapital,
        periodReturn,
        snapshotId: latestEligibleSnapshot(snapshots, date)?.snapshotId || null,
      });
      previousValue = valuation.value;
      previousMonth = monthKey(date);
      if (shouldRebalance(date, previousDate, rebalance)) previousDate = date;
    });

    if (snapshotUsage.some((item) => !item.noFutureDataRulePassed)) {
      throw new Error("Backtest rejected: a snapshot was used before it was generated.");
    }

    const finalPoint = curve.at(-1);
    const drawdown = maxDrawdown(curve);
    const timeWeightedReturn = periodReturns.reduce((index, value) => index * (1 + value), 1) - 1;
    const annualizedVolatility = stdev(periodReturns) * Math.sqrt(52);
    const annualizedReturn = Math.pow(1 + timeWeightedReturn, 52 / Math.max(1, periodReturns.length)) - 1;
    const sharpe = annualizedVolatility > 0 ? annualizedReturn / annualizedVolatility : 0;
    const finalHoldings = Object.entries(holdings).map(([ticker, shares]) => {
      const price = usdPrice(data, ticker, finalPoint.date);
      return {
        ticker,
        shares,
        currency: price?.currency || currencyFor(data, ticker),
        nativePrice: price?.nativePrice || null,
        fxToUsd: price?.fxToUsd || null,
        marketValueUsd: price ? shares * price.usdPrice : null,
      };
    });

    if (snapshots.length < 12) warnings.push(`Only ${snapshots.length} historical snapshots are available; results are not statistically meaningful.`);
    if (curve.length < 13) warnings.push(`Only ${curve.length} weekly valuation points are available.`);

    return {
      engineVersion: ENGINE_VERSION,
      generatedAt: new Date().toISOString(),
      strategy,
      assumptions: {
        initialCapital,
        monthlyContribution,
        rebalance,
        topN,
        slippage,
        baseCurrency: "USD",
        allowShort: false,
      },
      period: {
        start: curve[0].date,
        end: finalPoint.date,
        valuationPoints: curve.length,
        historicalSnapshots: snapshots.length,
      },
      summary: {
        finalValue: finalPoint.value,
        investedCapital,
        profit: finalPoint.value - investedCapital,
        moneyWeightedSimpleReturn: investedCapital > 0 ? finalPoint.value / investedCapital - 1 : 0,
        timeWeightedReturn,
        annualizedReturn,
        annualizedVolatility,
        maxDrawdown: drawdown.value,
        maxDrawdownStart: drawdown.start,
        maxDrawdownEnd: drawdown.end,
        sharpe,
        turnoverTrades: trades.length,
      },
      equityCurve: curve,
      monthlyRows: monthlyRows(curve, periodReturns),
      trades,
      rebalanceLog,
      snapshotUsage,
      finalHoldings,
      warnings: [...new Set(warnings)],
      sourceSnapshotIds: [...new Set(snapshotUsage.map((item) => item.snapshotId))],
    };
  }

  return { ENGINE_VERSION, runBacktest };
});
