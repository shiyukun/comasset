const translations = {
  zh: {
    brandSubtitle: "家庭投资研究台",
    navDashboard: "工作台",
    navRecommendations: "推荐列表",
    navAnalysis: "因子分析",
    navPortfolio: "家庭组合",
    navSimulation: "虚拟演练",
    navMethodology: "方法与披露",
    weeklyCadence: "每周推荐生成",
    privateUse: "家庭内部自用",
    pageTitle: "本周投资研究",
    asOf: "截至",
    weeklyOutput: "工具分析产出",
    summaryTitle: "本周推荐概览",
    mockBadge: "原型数据",
    shortTerm: "短期",
    longTerm: "长期",
    ultraLong: "超长期",
    reviewNeeded: "需复核",
    riskTitle: "本周风险提醒",
    riskOne: "FOMC 点阵图和利率预期可能影响成长股估值。",
    riskTwo: "基金持仓需检查与现有科技股暴露的重叠。",
    riskThree: "短期交易建议需要等待成交量确认。",
    topIdeas: "本周 Top Ideas",
    viewAll: "查看全部",
    weeklyRecommendations: "每周推荐列表",
    recommendationsTitle: "短期、长期、超长期",
    all: "全部",
    assetType: "类型",
    horizon: "周期",
    score: "评分",
    confidence: "置信度",
    action: "建议",
    reason: "主要原因",
    familyStatus: "家庭状态",
    detailTitle: "标的详情",
    price: "价格",
    expectedRange: "预期区间",
    positionHint: "定位",
    risks: "主要风险",
    exitRules: "退出条件",
    factorBreakdown: "因子拆解",
    familyNote: "家庭备注",
    saveNote: "保存备注",
    notePlaceholder: "记录家庭讨论、买入条件或复核事项",
    statusWatch: "观察",
    statusOwned: "已持有",
    statusReview: "需复核",
    openDetail: "查看",
    selectIdea: "选择一条推荐查看详情。",
    claudeSummary: "Claude 摘要",
    claudeVersion: "Skill 版本",
    claudeInput: "输入范围",
    claudeCalledAt: "调用时间",
    factorSystem: "参数体系",
    analysisTitle: "影响股票与基金的核心因子",
    claudeTitle: "分析层要求",
    claudeBody: "股票、ETF 和共同基金分析必须保存 Claude 金融 skill 的摘要、输入范围、调用时间和版本，并与结构化数据共同进入评分流程。",
    auditStatus: "追溯状态",
    auditReady: "已纳入 PRD",
    portfolioEyebrow: "家庭持仓",
    portfolioTitle: "组合暴露与推荐重叠",
    portfolioValue: "组合市值",
    overlapRisk: "重叠风险",
    overlapTitle: "与本周推荐的持仓重叠",
    assetClass: "资产类别",
    sector: "行业/主题",
    marketValue: "市值",
    portfolioWeight: "权重",
    unrealizedGain: "未实现收益",
    overlapCount: "重叠标的",
    noOverlap: "暂无明显重叠",
    inRecommendedList: "在本周推荐中",
    backtest: "虚拟演练",
    simulationTitle: "10,000 美元月度投资模拟",
    initialCapital: "初始资金",
    monthlyContribution: "每月投入",
    rebalance: "调仓频率",
    monthly: "每月",
    quarterly: "每季度",
    strategySource: "策略来源",
    mixedStrategy: "短期 + 长期 + 超长期混合",
    ultraOnly: "仅超长期",
    benchmarkStrategy: "基准 SPY",
    finalValue: "最终资产",
    totalReturn: "总收益",
    maxDrawdown: "最大回撤",
    tradeLog: "月度交易记录",
    month: "月份",
    contribution: "投入",
    rebalanceAction: "调仓动作",
    portfolioValue: "资产",
    methodology: "方法",
    methodologyTitle: "评分、更新与披露",
    methodOneTitle: "每周快照",
    methodOneBody: "正式推荐每周生成一次，并保存评分、数据范围和模型版本，供虚拟演练复盘。",
    methodTwoTitle: "结构化数据 + Skill",
    methodTwoBody: "Claude 金融 skill 用于解释、摘要和风险识别，但最终推荐标签不能只由自然语言判断产生。",
    methodThreeTitle: "风险披露",
    methodThreeBody: "本工具仅用于家庭内部研究和教育，不构成投资、法律或税务建议。",
    stock: "股票",
    etf: "ETF",
    fund: "共同基金",
    buy: "买入",
    watch: "观察",
    dca: "定投观察",
    high: "高",
    medium: "中",
    low: "低",
    claudeAudit: "Claude 金融 skill 摘要已保存",
    factors: ["基本面", "估值", "动量", "基金质量", "宏观敏感度", "风险控制"],
    factorKeys: {
      fundamentals: "基本面",
      valuation: "估值",
      momentum: "动量",
      fundQuality: "基金质量",
      macroSensitivity: "宏观敏感度",
      riskControl: "风险控制",
    },
  },
  en: {
    brandSubtitle: "Family investment desk",
    navDashboard: "Dashboard",
    navRecommendations: "Recommendations",
    navAnalysis: "Factor Analysis",
    navPortfolio: "Portfolio",
    navSimulation: "Simulation",
    navMethodology: "Methodology",
    weeklyCadence: "Weekly recommendations",
    privateUse: "Family use only",
    pageTitle: "Weekly Investment Research",
    asOf: "As of",
    weeklyOutput: "Tool-generated output",
    summaryTitle: "Weekly Recommendation Overview",
    mockBadge: "Prototype data",
    shortTerm: "Short",
    longTerm: "Long",
    ultraLong: "Ultra-long",
    reviewNeeded: "Review needed",
    riskTitle: "This Week's Risk Watch",
    riskOne: "FOMC dots and rate expectations may affect growth-stock valuations.",
    riskTwo: "Fund holdings should be checked against existing tech exposure.",
    riskThree: "Short-term ideas require volume confirmation.",
    topIdeas: "Weekly Top Ideas",
    viewAll: "View all",
    weeklyRecommendations: "Weekly recommendation list",
    recommendationsTitle: "Short, Long, Ultra-long",
    all: "All",
    assetType: "Type",
    horizon: "Horizon",
    score: "Score",
    confidence: "Confidence",
    action: "Action",
    reason: "Primary Reason",
    familyStatus: "Family Status",
    detailTitle: "Symbol Detail",
    price: "Price",
    expectedRange: "Expected Range",
    positionHint: "Role",
    risks: "Key Risks",
    exitRules: "Exit Rules",
    factorBreakdown: "Factor Breakdown",
    familyNote: "Family Note",
    saveNote: "Save Note",
    notePlaceholder: "Record family discussion, buy conditions, or review items",
    statusWatch: "Watch",
    statusOwned: "Owned",
    statusReview: "Review",
    openDetail: "Open",
    selectIdea: "Select a recommendation to view details.",
    claudeSummary: "Claude Summary",
    claudeVersion: "Skill Version",
    claudeInput: "Input Scope",
    claudeCalledAt: "Call Time",
    factorSystem: "Factor System",
    analysisTitle: "Key Factors for Stocks and Funds",
    claudeTitle: "Analysis Layer Requirement",
    claudeBody: "Stock, ETF, and mutual fund analysis must store the Claude financial skill summary, input scope, call time, and version, then combine it with structured data in scoring.",
    auditStatus: "Audit status",
    auditReady: "Included in PRD",
    portfolioEyebrow: "Family Holdings",
    portfolioTitle: "Portfolio Exposure and Recommendation Overlap",
    portfolioValue: "Portfolio Value",
    overlapRisk: "Overlap Risk",
    overlapTitle: "Overlap with This Week's Recommendations",
    assetClass: "Asset Class",
    sector: "Sector / Theme",
    marketValue: "Market Value",
    portfolioWeight: "Weight",
    unrealizedGain: "Unrealized Gain",
    overlapCount: "Overlapping names",
    noOverlap: "No material overlap",
    inRecommendedList: "In weekly recommendations",
    backtest: "Simulation",
    simulationTitle: "$10,000 Monthly Investment Simulation",
    initialCapital: "Initial capital",
    monthlyContribution: "Monthly contribution",
    rebalance: "Rebalance",
    monthly: "Monthly",
    quarterly: "Quarterly",
    strategySource: "Strategy source",
    mixedStrategy: "Short + Long + Ultra-long blend",
    ultraOnly: "Ultra-long only",
    benchmarkStrategy: "Benchmark SPY",
    finalValue: "Final value",
    totalReturn: "Total return",
    maxDrawdown: "Max drawdown",
    tradeLog: "Monthly Trade Log",
    month: "Month",
    contribution: "Contribution",
    rebalanceAction: "Rebalance Action",
    portfolioValue: "Value",
    methodology: "Method",
    methodologyTitle: "Scoring, Updates, and Disclosures",
    methodOneTitle: "Weekly snapshots",
    methodOneBody: "Formal recommendations are generated weekly and keep scoring, data scope, and model version snapshots for replay.",
    methodTwoTitle: "Structured Data + Skill",
    methodTwoBody: "Claude financial skill is used for explanations, summaries, and risk detection, but final labels cannot rely on natural-language judgment alone.",
    methodThreeTitle: "Risk disclosure",
    methodThreeBody: "This tool is for family research and education only, not investment, legal, or tax advice.",
    stock: "Stock",
    etf: "ETF",
    fund: "Mutual fund",
    buy: "Buy",
    watch: "Watch",
    dca: "DCA watch",
    high: "High",
    medium: "Medium",
    low: "Low",
    claudeAudit: "Claude financial skill summary stored",
    factors: ["Fundamental", "Valuation", "Momentum", "Fund Quality", "Macro Sensitivity", "Risk Control"],
    factorKeys: {
      fundamentals: "Fundamental",
      valuation: "Valuation",
      momentum: "Momentum",
      fundQuality: "Fund Quality",
      macroSensitivity: "Macro Sensitivity",
      riskControl: "Risk Control",
    },
  },
};

const recommendations = window.comassetData.recommendations;
const portfolio = window.comassetPortfolio;
const factorValues = Object.values(window.comassetData.factorValues);
const storageKey = "comasset-family-state-v1";

let currentLang = "zh";
let currentHorizon = "all";
let selectedTicker = recommendations[0]?.ticker;
let familyState = readFamilyState();
let currentSimulation = null;

function t(key) {
  return translations[currentLang][key] ?? key;
}

function horizonLabel(horizon) {
  if (horizon === "short") return t("shortTerm");
  if (horizon === "long") return t("longTerm");
  return t("ultraLong");
}

function localReason(item) {
  return currentLang === "zh" ? item.reasonZh : item.reasonEn;
}

function localList(item, key) {
  return currentLang === "zh" ? item[`${key}Zh`] : item[`${key}En`];
}

function localClaudeSummary(item) {
  return currentLang === "zh" ? item.claude.summaryZh : item.claude.summaryEn;
}

function readFamilyState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function writeFamilyState() {
  localStorage.setItem(storageKey, JSON.stringify(familyState));
}

function getSymbolState(ticker) {
  if (!familyState[ticker]) {
    familyState[ticker] = { status: "watch", note: "" };
  }
  return familyState[ticker];
}

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (translations[lang][key]) node.textContent = translations[lang][key];
  });
  document.querySelectorAll(".lang-toggle").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });
  renderRecommendations();
  renderTopIdeas();
  renderFactors();
  renderAuditList();
  renderDetail();
  renderPortfolio();
  renderSimulation();
  drawCharts();
}

function setView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
}

function filteredRecommendations() {
  if (currentHorizon === "all") return recommendations;
  return recommendations.filter((item) => item.horizon === currentHorizon);
}

function renderTopIdeas() {
  const container = document.getElementById("topIdeas");
  container.innerHTML = recommendations
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(
      (item) => `
        <article class="idea-card" data-ticker="${item.ticker}">
          <div class="idea-top">
            <div>
              <div class="ticker">${item.ticker}</div>
              <span class="asset-type">${t(item.type)}</span>
            </div>
            <div class="score-ring" style="--score:${item.score}"><span>${item.score}</span></div>
          </div>
          <div>
            <span class="horizon-pill">${horizonLabel(item.horizon)}</span>
            <span class="confidence-pill">${t(item.confidence)}</span>
          </div>
          <p class="reason">${localReason(item)}</p>
          <div class="claude-note">${t("claudeAudit")}</div>
        </article>
      `
    )
    .join("");
}

function renderRecommendations() {
  const rows = document.getElementById("recommendationRows");
  rows.innerHTML = filteredRecommendations()
    .map(
      (item) => {
        const state = getSymbolState(item.ticker);
        return `
        <tr class="${item.ticker === selectedTicker ? "selected-row" : ""}" data-ticker="${item.ticker}">
          <td><strong>${item.ticker}</strong></td>
          <td>${t(item.type)}</td>
          <td><span class="horizon-pill">${horizonLabel(item.horizon)}</span></td>
          <td><strong>${item.score}</strong></td>
          <td>${t(item.confidence)}</td>
          <td>${t(item.action)}</td>
          <td>${localReason(item)}</td>
          <td><span class="status-chip">${statusLabel(state.status)}</span></td>
        </tr>
      `;
      }
    )
    .join("");
  document.querySelectorAll("#recommendationRows tr").forEach((row) => {
    row.addEventListener("click", () => selectTicker(row.dataset.ticker));
  });
}

function renderFactors() {
  const matrix = document.getElementById("factorMatrix");
  matrix.innerHTML = Object.values(t("factorKeys"))
    .map((label, index) => {
      const color = index % 2 === 0 ? "#285f9f" : "#207a5c";
      return `
        <article class="factor-card">
          <h4>${label}</h4>
          <div class="bar"><span style="--value:${factorValues[index]}%; --bar:${color}"></span></div>
          <p>${factorValues[index]}/100</p>
        </article>
      `;
    })
    .join("");
}

function statusLabel(status) {
  if (status === "owned") return t("statusOwned");
  if (status === "review") return t("statusReview");
  return t("statusWatch");
}

function selectTicker(ticker) {
  selectedTicker = ticker;
  renderRecommendations();
  renderDetail();
  setView("recommendations");
}

function renderCounts() {
  document.getElementById("shortCount").textContent = recommendations.filter((item) => item.horizon === "short").length;
  document.getElementById("longCount").textContent = recommendations.filter((item) => item.horizon === "long").length;
  document.getElementById("ultraCount").textContent = recommendations.filter((item) => item.horizon === "ultra").length;
}

function renderDetail() {
  const panel = document.getElementById("detailPanel");
  const item = recommendations.find((candidate) => candidate.ticker === selectedTicker);
  if (!item) {
    panel.innerHTML = `<div class="empty-detail">${t("selectIdea")}</div>`;
    return;
  }
  const state = getSymbolState(item.ticker);
  const factorEntries = Object.entries(item.factors).filter(([, value]) => value > 0);
  panel.innerHTML = `
    <div class="detail-header">
      <div>
        <p class="eyebrow">${t("detailTitle")}</p>
        <h3>${item.ticker} <span>${t(item.type)} · ${horizonLabel(item.horizon)}</span></h3>
      </div>
      <div class="detail-score">${item.score}</div>
    </div>
    <div class="detail-metrics">
      <div><span>${t("price")}</span><strong>${item.price}</strong></div>
      <div><span>${t("expectedRange")}</span><strong>${item.expectedRange}</strong></div>
      <div><span>${t("positionHint")}</span><strong>${item.positionHint}</strong></div>
    </div>
    <p class="detail-reason">${localReason(item)}</p>
    <div class="detail-grid">
      <section>
        <h4>${t("factorBreakdown")}</h4>
        ${factorEntries
          .map(
            ([key, value]) => `
              <div class="mini-factor">
                <span>${t("factorKeys")[key]}</span>
                <div class="bar"><span style="--value:${value}%; --bar:#207a5c"></span></div>
                <strong>${value}</strong>
              </div>
            `
          )
          .join("")}
      </section>
      <section>
        <h4>${t("risks")}</h4>
        <ul>${localList(item, "risks").map((risk) => `<li>${risk}</li>`).join("")}</ul>
      </section>
      <section>
        <h4>${t("exitRules")}</h4>
        <ul>${localList(item, "exit").map((rule) => `<li>${rule}</li>`).join("")}</ul>
      </section>
      <section class="claude-audit-card">
        <h4>${t("claudeSummary")}</h4>
        <p>${localClaudeSummary(item)}</p>
        <dl>
          <div><dt>${t("claudeVersion")}</dt><dd>${item.claude.version}</dd></div>
          <div><dt>${t("claudeCalledAt")}</dt><dd>${item.claude.calledAt}</dd></div>
          <div><dt>${t("claudeInput")}</dt><dd>${item.claude.inputScope}</dd></div>
        </dl>
      </section>
    </div>
    <div class="family-note-panel">
      <div>
        <label for="familyStatus">${t("familyStatus")}</label>
        <select id="familyStatus">
          <option value="watch" ${state.status === "watch" ? "selected" : ""}>${t("statusWatch")}</option>
          <option value="owned" ${state.status === "owned" ? "selected" : ""}>${t("statusOwned")}</option>
          <option value="review" ${state.status === "review" ? "selected" : ""}>${t("statusReview")}</option>
        </select>
      </div>
      <div>
        <label for="familyNote">${t("familyNote")}</label>
        <textarea id="familyNote" placeholder="${t("notePlaceholder")}">${state.note || ""}</textarea>
      </div>
      <button class="primary-button" id="saveFamilyNote">${t("saveNote")}</button>
    </div>
  `;
  document.getElementById("saveFamilyNote").addEventListener("click", () => {
    familyState[item.ticker] = {
      status: document.getElementById("familyStatus").value,
      note: document.getElementById("familyNote").value.trim(),
    };
    writeFamilyState();
    renderRecommendations();
    renderDetail();
  });
}

function renderAuditList() {
  const list = document.getElementById("auditList");
  list.innerHTML = recommendations
    .slice(0, 5)
    .map(
      (item) => `
        <button class="audit-row" data-ticker="${item.ticker}">
          <strong>${item.ticker}</strong>
          <span>${item.claude.calledAt}</span>
        </button>
      `
    )
    .join("");
  document.querySelectorAll(".audit-row").forEach((row) => {
    row.addEventListener("click", () => selectTicker(row.dataset.ticker));
  });
}

function portfolioTotalValue() {
  return portfolio.holdings.reduce((sum, holding) => sum + holding.value, 0);
}

function aggregateByAssetClass() {
  const total = portfolioTotalValue();
  const exposure = new Map();
  portfolio.holdings.forEach((holding) => {
    exposure.set(holding.assetClass, (exposure.get(holding.assetClass) || 0) + holding.value);
  });
  return [...exposure.entries()].map(([label, value]) => ({
    label,
    value,
    weight: total > 0 ? value / total : 0,
  }));
}

function holdingGain(holding) {
  return holding.costBasis > 0 ? (holding.value - holding.costBasis) / holding.costBasis : 0;
}

function renderPortfolio() {
  const total = portfolioTotalValue();
  const recommendationTickers = new Set(recommendations.map((item) => item.ticker));
  document.getElementById("portfolioTotalValue").textContent = formatCurrency(total);
  document.getElementById("portfolioAsOf").textContent = portfolio.asOf;

  document.getElementById("portfolioRows").innerHTML = portfolio.holdings
    .map(
      (holding) => `
        <tr>
          <td><strong>${holding.ticker}</strong></td>
          <td>${t(holding.type)}</td>
          <td>${holding.assetClass}</td>
          <td>${holding.sector}</td>
          <td>${formatCurrency(holding.value)}</td>
          <td>${(holding.weight * 100).toFixed(1)}%</td>
          <td>${formatPercent(holdingGain(holding))}</td>
        </tr>
      `
    )
    .join("");

  const overlapRows = portfolio.holdings
    .map((holding) => {
      const directOverlap = recommendationTickers.has(holding.ticker) ? [holding.ticker] : [];
      const underlyingOverlap = holding.overlapTickers.filter((ticker) => recommendationTickers.has(ticker));
      const overlap = [...new Set([...directOverlap, ...underlyingOverlap])];
      return { holding, overlap };
    })
    .filter((item) => item.overlap.length > 0);

  document.getElementById("overlapList").innerHTML = overlapRows.length
    ? overlapRows
        .map(
          ({ holding, overlap }) => `
            <button class="overlap-row" data-ticker="${overlap[0]}">
              <div>
                <strong>${holding.ticker}</strong>
                <span>${t("overlapCount")}: ${overlap.join(", ")}</span>
              </div>
              <span>${(holding.weight * 100).toFixed(1)}%</span>
            </button>
          `
        )
        .join("")
    : `<div class="empty-detail">${t("noOverlap")}</div>`;

  document.querySelectorAll(".overlap-row").forEach((row) => {
    row.addEventListener("click", () => selectTicker(row.dataset.ticker));
  });
}

function drawPortfolioChart() {
  const canvas = document.getElementById("portfolioChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const data = aggregateByAssetClass();
  const colors = ["#207a5c", "#285f9f", "#9d752d", "#b34747"];
  const centerX = 115;
  const centerY = 110;
  const radius = 74;
  let start = -Math.PI / 2;

  data.forEach((item, index) => {
    const angle = item.weight * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    start += angle;
  });

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#17201c";
  ctx.font = "800 16px system-ui";
  ctx.fillText("Asset", centerX - 22, centerY - 2);
  ctx.fillText("Mix", centerX - 14, centerY + 18);

  data.forEach((item, index) => {
    const y = 60 + index * 34;
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(250, y - 12, 16, 16);
    ctx.fillStyle = "#17201c";
    ctx.font = "700 13px system-ui";
    ctx.fillText(item.label, 276, y);
    ctx.fillStyle = "#69756f";
    ctx.fillText(`${(item.weight * 100).toFixed(1)}%`, 276, y + 16);
  });
}

function drawAllocationChart() {
  const canvas = document.getElementById("allocationChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const data = [
    { label: t("shortTerm"), value: 22, color: "#285f9f" },
    { label: t("longTerm"), value: 34, color: "#207a5c" },
    { label: t("ultraLong"), value: 44, color: "#9d752d" },
  ];
  let x = 34;
  data.forEach((item, index) => {
    const height = item.value * 3;
    ctx.fillStyle = item.color;
    ctx.fillRect(x, 160 - height, 72, height);
    ctx.fillStyle = "#17201c";
    ctx.font = "700 14px system-ui";
    ctx.fillText(`${item.value}%`, x + 18, 148 - height);
    ctx.fillStyle = "#69756f";
    ctx.font = "12px system-ui";
    ctx.fillText(item.label, x + 2, 178);
    x += 145 + index * 8;
  });
  ctx.strokeStyle = "#dbe2dd";
  ctx.beginPath();
  ctx.moveTo(24, 160);
  ctx.lineTo(500, 160);
  ctx.stroke();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value) {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function getSimulationInputs() {
  return {
    initialCapital: Number(document.getElementById("initialCapitalInput").value) || 0,
    monthlyContribution: Number(document.getElementById("monthlyContributionInput").value) || 0,
    rebalance: document.getElementById("rebalanceSelect").value,
    strategy: document.getElementById("strategySelect").value,
  };
}

function calculateSimulation() {
  const inputs = getSimulationInputs();
  const assumptions = window.comassetData.simulationAssumptions[inputs.strategy];
  let value = inputs.initialCapital;
  let peak = value;
  let maxDrawdown = 0;
  const points = [];
  const rows = [];

  assumptions.monthlyReturns.forEach((monthlyReturn, index) => {
    value += inputs.monthlyContribution;
    value *= 1 + monthlyReturn;
    peak = Math.max(peak, value);
    maxDrawdown = Math.min(maxDrawdown, (value - peak) / peak);
    points.push(Math.round(value));
    const shouldRebalance = inputs.rebalance === "monthly" || index % 3 === 0;
    rows.push({
      month: index + 1,
      contribution: inputs.monthlyContribution,
      action: shouldRebalance ? assumptions.trades.join(" / ") : "-",
      value,
    });
  });

  const invested = inputs.initialCapital + inputs.monthlyContribution * assumptions.monthlyReturns.length;
  const totalReturn = invested > 0 ? (value - invested) / invested : 0;
  const avgMonthly = assumptions.monthlyReturns.reduce((sum, item) => sum + item, 0) / assumptions.monthlyReturns.length;
  const sharpe = assumptions.volatility > 0 ? (avgMonthly * 12) / assumptions.volatility : 0;

  return {
    points,
    rows,
    finalValue: value,
    invested,
    totalReturn,
    maxDrawdown,
    sharpe,
  };
}

function renderSimulation() {
  currentSimulation = calculateSimulation();
  document.getElementById("finalValueMetric").textContent = formatCurrency(currentSimulation.finalValue);
  document.getElementById("totalReturnMetric").textContent = formatPercent(currentSimulation.totalReturn);
  document.getElementById("maxDrawdownMetric").textContent = formatPercent(currentSimulation.maxDrawdown);
  document.getElementById("sharpeMetric").textContent = currentSimulation.sharpe.toFixed(2);

  const rows = document.getElementById("tradeLogRows");
  rows.innerHTML = `
    <div class="trade-log-header">
      <span>${t("month")}</span>
      <span>${t("contribution")}</span>
      <span>${t("rebalanceAction")}</span>
      <span>${t("portfolioValue")}</span>
    </div>
    ${currentSimulation.rows
      .map(
        (row) => `
          <div class="trade-log-row">
            <span>M${row.month}</span>
            <span>${formatCurrency(row.contribution)}</span>
            <span>${row.action}</span>
            <strong>${formatCurrency(row.value)}</strong>
          </div>
        `
      )
      .join("")}
  `;
}

function drawSimulationChart() {
  const canvas = document.getElementById("simulationChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const points = currentSimulation?.points || calculateSimulation().points;
  const min = Math.min(...points) * 0.94;
  const max = Math.max(...points) * 1.06;
  const left = 42;
  const top = 24;
  const width = canvas.width - 72;
  const height = canvas.height - 64;

  ctx.strokeStyle = "#dbe2dd";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = top + (height / 3) * i;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#207a5c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((value, index) => {
    const x = left + (width / (points.length - 1)) * index;
    const y = top + height - ((value - min) / (max - min)) * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#17201c";
  ctx.font = "700 14px system-ui";
  ctx.fillText(formatCurrency(points.at(-1)), left + width - 78, top + 18);
  ctx.fillStyle = "#69756f";
  ctx.font = "12px system-ui";
  ctx.fillText("12M", left + width - 20, top + height + 28);
  ctx.fillText("0M", left - 8, top + height + 28);
}

function drawCharts() {
  drawAllocationChart();
  drawPortfolioChart();
  drawSimulationChart();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelectorAll("[data-view-link]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.viewLink));
});

document.querySelectorAll(".lang-toggle").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

document.querySelectorAll(".filter-tab").forEach((button) => {
  button.addEventListener("click", () => {
    currentHorizon = button.dataset.horizon;
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      tab.classList.toggle("active", tab === button);
    });
    renderRecommendations();
  });
});

document.getElementById("simulationForm").addEventListener("input", () => {
  renderSimulation();
  drawSimulationChart();
});

document.getElementById("topIdeas").addEventListener("click", (event) => {
  const card = event.target.closest("[data-ticker]");
  if (card) selectTicker(card.dataset.ticker);
});

renderCounts();
renderRecommendations();
renderTopIdeas();
renderFactors();
renderAuditList();
renderDetail();
renderPortfolio();
renderSimulation();
drawCharts();

window.addEventListener("resize", drawCharts);
