(function () {
  function formatPrice(value, currency) {
    const supportedCurrency = currency || "USD";
    if (supportedCurrency === "SGD") {
      return `S$${Number(value).toLocaleString("en-SG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    const locale = supportedCurrency === "SGD" ? "en-SG" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: supportedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  function formatRange(range) {
    if (!range || range.low === null || range.high === null) return "N/A";
    const low = `${range.low >= 0 ? "+" : ""}${Math.round(range.low * 100)}%`;
    const high = `${range.high >= 0 ? "+" : ""}${Math.round(range.high * 100)}%`;
    return `${low} to ${high}`;
  }

  function formatCalledAt(value) {
    return String(value || "").replace("T", " ").replace("+08:00", " SGT");
  }

  function formatInputScope(scope) {
    return (scope || []).map((item) => String(item).replace(/_/g, " ")).join(", ");
  }

  function adaptSnapshot(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.recommendations)) return null;
    window.comassetSnapshot = snapshot;
    window.comassetData = {
    recommendations: snapshot.recommendations.map((item) => ({
      ticker: item.ticker,
      type: item.type,
      market: item.market || (item.currency === "SGD" ? "Singapore" : "United States"),
      exchange: item.exchange || "",
      country: item.country || "",
      horizon: item.horizon,
      score: item.score,
      confidence: item.confidence,
      action: item.action,
      price: formatPrice(item.price, item.currency),
      currency: item.currency || "USD",
      expectedRange: formatRange(item.expectedRange),
      positionHint: item.positionHint,
      factors: Object.fromEntries(
        Object.entries(item.factorScores || {}).map(([key, value]) => [key, value === null ? 0 : value])
      ),
      priceSignals: item.priceSignals,
      reasonZh: item.reason?.zh || "",
      reasonEn: item.reason?.en || "",
      risksZh: item.risks?.zh || [],
      risksEn: item.risks?.en || [],
      exitZh: item.exitRules?.zh || [],
      exitEn: item.exitRules?.en || [],
      holdings: item.holdings,
      newsEvents: item.newsEvents || { status: "missing", items: [] },
      codex: {
        version: item.codexAudit?.skillVersion || snapshot.codexAuditSkillVersion,
        calledAt: formatCalledAt(item.codexAudit?.calledAt || snapshot.generatedAt),
        inputScope: formatInputScope(item.codexAudit?.inputScope),
        summaryZh: item.codexAudit?.summary?.zh || "",
        summaryEn: item.codexAudit?.summary?.en || "",
        status: item.codexAudit?.status || "unknown",
      },
    })),
    factorValues: snapshot.factorValues || {},
    simulationAssumptions: snapshot.simulationAssumptions || {},
  };

    window.comassetDataSource = {
    mode: "snapshot",
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    source: snapshot.marketContext?.source,
    priceSource: snapshot.marketContext?.priceSource,
  };

    if (window.comassetConfig) {
      window.comassetConfig.weeklySnapshot = {
        ...(window.comassetConfig.weeklySnapshot || {}),
        snapshotId: snapshot.snapshotId,
        asOf: snapshot.asOf,
        generatedAt: snapshot.generatedAt,
        dataCutoff: snapshot.dataCutoff,
        updateCadence: snapshot.marketContext?.updateCadence || window.comassetConfig.weeklySnapshot?.updateCadence,
      };
    }
    return window.comassetData;
  }

  window.adaptComassetSnapshot = adaptSnapshot;
  adaptSnapshot(window.comassetSnapshot);
})();
