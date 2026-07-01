window.comassetDataStatus = {
  "asOf": "2026-07-01 19:29 SGT",
  "generatedAt": "2026-07-01T11:29:19.569Z",
  "sources": [
    {
      "id": "prices",
      "name": "Price History",
      "nameZh": "价格历史",
      "provider": "Yahoo Finance public chart endpoint",
      "cadence": "6 hours",
      "cadenceZh": "每 6 小时",
      "status": "ready",
      "lastUpdated": "2026-07-01 19:29 SGT",
      "coverage": 1,
      "notes": {
        "zh": "覆盖 16/16 条行情及基准序列。",
        "en": "Covers 16/16 price and benchmark series."
      }
    },
    {
      "id": "fundamentals",
      "name": "Fundamentals",
      "nameZh": "财务基本面",
      "provider": "SEC companyfacts API",
      "cadence": "Weekly",
      "cadenceZh": "每周",
      "status": "ready",
      "lastUpdated": "2026-06-30 20:59 SGT",
      "coverage": 1,
      "notes": {
        "zh": "SEC 可覆盖美国股票 3/3；新加坡股票仍需 SGX 数据源。",
        "en": "SEC covers 3/3 U.S. stocks; Singapore names still require an SGX source."
      }
    },
    {
      "id": "fund_holdings",
      "name": "ETF / Fund Holdings",
      "nameZh": "ETF / 基金持仓",
      "provider": "official issuer CSV or SEC N-PORT fallback",
      "cadence": "Monthly",
      "cadenceZh": "每月",
      "status": "ready",
      "lastUpdated": "2026-06-30 20:59 SGT",
      "coverage": 1,
      "notes": {
        "zh": "官方持仓覆盖 4/4 只 ETF/基金。",
        "en": "Official holdings cover 4/4 ETFs/funds."
      }
    },
    {
      "id": "macro",
      "name": "Macro Indicators",
      "nameZh": "宏观指标",
      "provider": "FRED fredgraph.csv",
      "cadence": "Weekly",
      "cadenceZh": "每周",
      "status": "ready",
      "lastUpdated": "2026-06-30 20:56 SGT",
      "coverage": 1,
      "notes": {
        "zh": "已取得 8/8 组宏观序列。",
        "en": "Loaded 8/8 macro series."
      }
    },
    {
      "id": "news_events",
      "name": "News and Events",
      "nameZh": "新闻与事件",
      "provider": "Yahoo Finance RSS + SEC EDGAR",
      "cadence": "6 hours",
      "cadenceZh": "每 6 小时",
      "status": "ready",
      "lastUpdated": "2026-07-01 19:29 SGT",
      "coverage": 1,
      "notes": {
        "zh": "新闻或监管事件覆盖 12/12 个研究标的。",
        "en": "News or regulatory events cover 12/12 research symbols."
      }
    },
    {
      "id": "codex_public_equity_skill",
      "name": "Codex Public Equity Investing Skill",
      "nameZh": "Codex 公开股票投资 Skill",
      "provider": "Codex review workflow",
      "cadence": "After changed snapshot",
      "cadenceZh": "快照变化后复核",
      "status": "ready",
      "lastUpdated": "2026-06-30 20:58 SGT",
      "coverage": 1,
      "notes": {
        "zh": "当前 9/9 条推荐与最新输入匹配并完成 Codex 复核；结构化评分不依赖此覆盖率。",
        "en": "9/9 recommendations currently have Codex review matched to the latest inputs; deterministic scoring does not depend on this coverage."
      }
    }
  ]
};
