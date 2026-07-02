window.comassetWatchlist = {
  "version": "watchlist-v2",
  "generatedAt": "2026-07-02T13:38:25.497Z",
  "asOf": "2026-07-02",
  "mode": "custom_watchlist_analysis",
  "recommendationPolicy": "These items are user-selected research targets and are excluded from recommendation ranking and backtest selection.",
  "horizonAnalysisPolicy": "Screen-grade Public Equity Investing judgments for research use; not account-specific trade instructions.",
  "sources": {
    "definitions": "data/custom_watchlist.json",
    "prices": "data/live_prices.json",
    "newsEvents": "data/live_news_events.json",
    "holdings": "data/live_holdings.json",
    "fundamentals": "data/live_fundamentals.json"
  },
  "items": [
    {
      "ticker": "GRAB",
      "displayName": "Grab Holdings Limited",
      "type": "stock",
      "market": "United States",
      "exchange": "Nasdaq",
      "country": "SG",
      "currency": "USD",
      "researchPriority": "high",
      "triageStatus": "watchlist_needs_trigger",
      "recommendationEligible": false,
      "backtestEligible": false,
      "horizonRecommendations": {
        "sixMonths": {
          "action": "hold",
          "confidence": "medium",
          "rationale": {
            "zh": "实时数据复核 66/100：动量 74、基本面或基金质量 55、风险韧性 90，事件扣分 8。 Q1 收入和盈利能力继续改善，但台湾 foodpanda 交易、银行业务扩张和贷款组合快速增长会在未来两个季度带来整合与信用成本不确定性。已有仓位以持有观察为主，不追涨。",
            "en": "Live-data review 66/100: momentum 74, fundamentals or fund quality 55, risk resilience 90, and event penalty 8. Q1 revenue and profitability improved, but the Taiwan foodpanda transaction, banking expansion, and rapid loan-book growth add integration and credit-cost uncertainty over the next two quarters. Hold existing exposure rather than chase it."
          },
          "upgradeTrigger": {
            "zh": "维持 2026 年收入与 Adjusted EBITDA 指引，且信用成本、并购整合和自由现金流没有恶化。",
            "en": "Maintain 2026 revenue and Adjusted EBITDA guidance without deterioration in credit costs, integration, or free cash flow."
          },
          "downgradeTrigger": {
            "zh": "下调全年指引、金融服务亏损重新扩大，或连续两个季度自由现金流转弱。",
            "en": "A full-year guidance cut, renewed widening of Financial Services losses, or two consecutive quarters of weaker free cash flow."
          },
          "liveScore": 66,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 74,
            "fundamentals": 55,
            "risk": 90,
            "eventPenalty": 8
          }
        },
        "oneYear": {
          "action": "hold",
          "confidence": "medium",
          "rationale": {
            "zh": "实时数据复核 63/100：动量 74、基本面或基金质量 55、风险韧性 90，事件扣分 8。 若 2026 年 20%-22% 收入增长和 40%-44% Adjusted EBITDA 增长兑现，平台经营杠杆和回购有望支撑未来一年的风险回报，适合分批建立而不是一次性重仓。",
            "en": "Live-data review 63/100: momentum 74, fundamentals or fund quality 55, risk resilience 90, and event penalty 8. If 2026 revenue growth of 20%-22% and Adjusted EBITDA growth of 40%-44% are delivered, platform operating leverage and the buyback should support one-year risk/reward. Build gradually rather than in one step."
          },
          "upgradeTrigger": {
            "zh": "Deliveries 利润率继续扩张，金融服务接近盈亏平衡，且并购没有显著摊薄回报。",
            "en": "Further Deliveries margin expansion, Financial Services approaching breakeven, and no material return dilution from acquisitions."
          },
          "downgradeTrigger": {
            "zh": "用户增长依赖更高补贴，贷款损失率快速上升，或资本配置偏离现金回报纪律。",
            "en": "User growth requires materially higher incentives, loan losses rise sharply, or capital allocation departs from cash-return discipline."
          },
          "liveScore": 63,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 74,
            "fundamentals": 55,
            "risk": 90,
            "eventPenalty": 8
          }
        },
        "twoPlusYears": {
          "action": "hold",
          "confidence": "medium",
          "rationale": {
            "zh": "实时数据复核 61/100：动量 74、基本面或基金质量 55、风险韧性 90，事件扣分 8。 东南亚移动出行、配送、广告和金融服务的交叉销售仍有长期复利空间；核心前提是金融服务风险可控、并购整合不破坏现金流。长期仅建议分批买进。",
            "en": "Live-data review 61/100: momentum 74, fundamentals or fund quality 55, risk resilience 90, and event penalty 8. Cross-selling across Southeast Asian mobility, deliveries, advertising, and financial services retains long-duration compounding potential. The case requires controlled financial-services risk and M&A that does not impair cash flow; use phased buying only."
          },
          "upgradeTrigger": {
            "zh": "持续正向自由现金流、核心业务份额稳定，并证明新市场扩张可以获得合理资本回报。",
            "en": "Sustained positive free cash flow, stable core-market share, and evidence that new-market expansion earns acceptable returns."
          },
          "downgradeTrigger": {
            "zh": "监管限制削弱平台经济性，金融服务出现结构性信用损失，或长期 ROIC 无法覆盖资本成本。",
            "en": "Regulation impairs platform economics, Financial Services develops structural credit losses, or long-run ROIC fails to cover the cost of capital."
          },
          "liveScore": 61,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 74,
            "fundamentals": 55,
            "risk": 90,
            "eventPenalty": 8
          }
        }
      },
      "summary": {
        "zh": "东南亚超级应用平台，核心观察点是移动出行、外卖和金融服务之间的经营杠杆，以及并购扩张后的资本配置纪律。",
        "en": "A Southeast Asian superapp; the key watch items are operating leverage across mobility, deliveries, and financial services, plus capital discipline after acquisitions."
      },
      "whyNow": {
        "zh": "公司正在执行股份回购，同时推进金融服务和区域并购，2026 年的整合质量可能重塑盈利路径。",
        "en": "The company is executing a buyback while expanding financial services and regional M&A, making 2026 integration quality important to the earnings path."
      },
      "watchFor": {
        "zh": [
          "Adjusted EBITDA 与自由现金流转换",
          "金融服务贷款增长和信用成本",
          "台湾 foodpanda、Stash 与 Superbank 整合进度"
        ],
        "en": [
          "Adjusted EBITDA and free-cash-flow conversion",
          "Financial-services loan growth and credit costs",
          "Integration of Taiwan foodpanda, Stash, and Superbank"
        ]
      },
      "risks": {
        "zh": [
          "高强度竞争和补贴可能压缩利润",
          "金融服务扩张增加信用及监管风险",
          "并购整合可能稀释管理注意力和资本回报"
        ],
        "en": [
          "Competition and incentives may pressure margins",
          "Financial-services expansion adds credit and regulatory risk",
          "M&A integration may dilute management focus and returns on capital"
        ]
      },
      "nextResearch": {
        "zh": "复核 Q1 2026 分部数据、2026 指引和三项并购的资金占用。",
        "en": "Review Q1 2026 segment data, 2026 guidance, and funding needs for the three transactions."
      },
      "sources": [
        {
          "label": "Grab Quarterly Results",
          "url": "https://investors.grab.com/financial-information/quarterly-results/default.aspx",
          "type": "company_ir"
        },
        {
          "label": "Grab Q1 2026 Results",
          "url": "https://s205.q4cdn.com/179588156/files/doc_financials/2026/q1/Grab-Reports-Q1-2026-Results.pdf",
          "type": "company_ir"
        },
        {
          "label": "Grab News and Events",
          "url": "https://investors.grab.com/news-and-events/default.aspx",
          "type": "company_ir"
        }
      ],
      "priceSignals": {
        "status": "ready",
        "points": 79,
        "price": 3.925,
        "asOf": "2026-07-02",
        "oneWeekReturn": 0.10563380281690149,
        "oneMonthReturn": 0.1751497005988023,
        "threeMonthReturn": 0.06657608695652173,
        "maxDrawdown": -0.4835680751173709,
        "annualizedVolatility": 0.4452274073641137
      },
      "newsEvents": {
        "status": "ready",
        "asOf": "2026-07-02T13:38:23.030Z",
        "itemCount": 8,
        "highImpactCount": 2,
        "items": [
          {
            "id": "yahoo-rss-21d58649-9b9f-361f-8d8a-afa0e81bf174",
            "ticker": "GRAB",
            "kind": "news",
            "category": "earnings",
            "headline": "Grab Holdings (GRAB) Is Up 7.3% After Analysts Lift Earnings Estimates - Has The Bull Case Changed?",
            "summary": "In recent days, Grab Holdings Limited has become one of the most watched stocks on Zacks.com after analysts lifted earnings estimates for the current and next fiscal years. This shift in expectations reflects growing attention to Grab’s profitability trajectory as its superapp and fintech businesses scale across Southeast Asia. We’ll now examine how these upward earnings revisions and rising investor focus may shape Grab’s existing investment narrative and long-term thesis. This technology...",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-29T23:11:50.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/grab-holdings-grab-7-3-231150532.html?.tsrc=rss",
            "relatedTickers": [
              "GRAB"
            ],
            "confidence": "medium",
            "impact": "high",
            "decisionPressure": 91,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 4,
            "actionabilityScore": 4,
            "priority": "high"
          },
          {
            "id": "yahoo-rss-5573b658-1397-332d-b240-6b20823fd22a",
            "ticker": "GRAB",
            "kind": "news",
            "category": "earnings",
            "headline": "3 Penny Stocks Under $5 Backed by Real Revenue Growth",
            "summary": "These three penny stocks under $5 generate real revenue and have catalysts that analysts believe could drive significant upside",
            "publisher": "marketbeat.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-20T13:20:00.000Z",
            "sourceUrl": "https://www.marketbeat.com/originals/3-penny-stocks-under-5-backed-by-real-revenue-growth/?utm_source=yahoofinance&utm_medium=yahoofinance&.tsrc=rss",
            "relatedTickers": [
              "GRAB"
            ],
            "confidence": "medium",
            "impact": "high",
            "decisionPressure": 85,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 4,
            "actionabilityScore": 4,
            "priority": "high"
          },
          {
            "id": "yahoo-rss-934afa62-0c10-3f12-8026-14537baa1722",
            "ticker": "GRAB",
            "kind": "news",
            "category": "product",
            "headline": "Forget SpaceX: Redditors Think This Asian Stock Has 10X Potential",
            "summary": "We just covered the 10 Stocks That Will 10X According to Social Media. Grab Holdings (NASDAQ:GRAB) ranks #3 (see 5 Stocks That Will 10X According to Social Media). Number of Hedge Fund Investors: 50 Grab Holdings (NASDAQ:GRAB) is Southeast Asia’s dominant super-app spanning ride-hailing, food delivery, grocery delivery, and financial services including digital banking, lending, […]",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-23T19:49:00.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/forget-spacex-redditors-think-asian-194900562.html?.tsrc=rss",
            "relatedTickers": [
              "GRAB"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 63,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-d76b1221-3a36-3b78-84f7-dcee8811fa0b",
            "ticker": "GRAB",
            "kind": "news",
            "category": "product",
            "headline": "Grab (GRAB) to Consolidate Superbank Following Increased Shareholding in Indonesia",
            "summary": "Grab Holdings Ltd. (NASDAQ:GRAB) is one of the penny stocks with explosive growth potential. On May 20, Grab is set to consolidate PT Super Bank Indonesia Tbk (“Superbank”) into its financial services segment following the transfer of Singtel’s stake to GXS Bank. This move increases Grab’s direct and indirect shareholding to over 50%, marking a […]",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-20T17:28:07.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/grab-grab-consolidate-superbank-following-172807475.html?.tsrc=rss",
            "relatedTickers": [
              "GRAB"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 63,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-bb295881-5cda-3380-acc9-691d48ad2d21",
            "ticker": "GRAB",
            "kind": "news",
            "category": "other",
            "headline": "Grab Holdings Limited (GRAB) Advances While Market Declines: Some Information for Investors",
            "summary": "In the latest trading session, Grab Holdings Limited (GRAB) closed at $3.55, marking a +2.6% move from the previous day.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-26T21:50:02.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/grab-holdings-limited-grab-advances-215002009.html?.tsrc=rss",
            "relatedTickers": [
              "GRAB"
            ],
            "confidence": "medium",
            "impact": "low",
            "decisionPressure": 49,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low"
          },
          {
            "id": "yahoo-rss-2797158b-32c2-3772-b181-4bea49c82ae1",
            "ticker": "GRAB",
            "kind": "news",
            "category": "other",
            "headline": "Grab Holdings Limited (GRAB) is Attracting Investor Attention: Here is What You Should Know",
            "summary": "Grab (GRAB) has been one of the stocks most watched by Zacks.com users lately. So, it is worth exploring what lies ahead for the stock.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-26T13:00:06.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/grab-holdings-limited-grab-attracting-130006153.html?.tsrc=rss",
            "relatedTickers": [
              "GRAB"
            ],
            "confidence": "medium",
            "impact": "low",
            "decisionPressure": 49,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low"
          },
          {
            "id": "yahoo-rss-6f8ad0cd-4349-3207-ad7a-c40be2de4703",
            "ticker": "GRAB",
            "kind": "news",
            "category": "other",
            "headline": "Brokers Suggest Investing in Grab (GRAB): Read This Before Placing a Bet",
            "summary": "The average brokerage recommendation (ABR) for Grab (GRAB) is equivalent to a Buy. The overly optimistic recommendations of Wall Street analysts make the effectiveness of this highly sought-after metric questionable. So, is it worth buying the stock?",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-24T13:30:06.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/brokers-suggest-investing-grab-grab-133006403.html?.tsrc=rss",
            "relatedTickers": [
              "GRAB"
            ],
            "confidence": "medium",
            "impact": "low",
            "decisionPressure": 43,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low"
          },
          {
            "id": "yahoo-rss-c8cb1a2b-3203-3042-8d33-fe7223d9f289",
            "ticker": "GRAB",
            "kind": "news",
            "category": "macro",
            "headline": "Here Is the 1 Dirt-Cheap Super-App Monopoly I Keep Accumulating on Repeat",
            "summary": "I keep hitting the buy button on Grab (NASDAQ:GRAB) and I am not done. While Wall Street obsesses over June tech prices and broader indices wobble on inflation worries, I am quietly adding shares of a Southeast Asian super-app that, in my view, is being mispriced as a volatile penny stock when the underlying business ... Here Is the 1 Dirt-Cheap Super-App Monopoly I Keep Accumulating on Repeat",
            "publisher": "247wallst.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-23T17:31:08.000Z",
            "sourceUrl": "https://247wallst.com/investing/2026/06/23/here-is-the-1-dirt-cheap-super-app-monopoly-i-keep-accumulating-on-repeat/?.tsrc=rss",
            "relatedTickers": [
              "GRAB"
            ],
            "confidence": "medium",
            "impact": "low",
            "decisionPressure": 43,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low"
          }
        ]
      },
      "holdings": null,
      "fundamentals": {
        "status": "ready",
        "asOf": "2026-07-02T13:38:13.496Z",
        "metrics": {
          "revenueGrowth": null,
          "netIncomeGrowth": null,
          "freeCashFlowMargin": null,
          "debtToEquity": null,
          "fundamentalsScore": 55,
          "riskScore": 90
        }
      },
      "evidenceGaps": [],
      "analysisConfidence": "medium",
      "workflowAudit": {
        "workflow": "Comasset deterministic horizon refresh",
        "version": "0.1.29",
        "reviewedAt": "2026-07-02T13:38:25.497Z",
        "classification": "user_selected_watchlist_horizon_actions",
        "recommendationExcluded": true,
        "horizonAnalysisAsOf": "2026-07-02",
        "refreshedAt": "2026-07-02T13:38:25.497Z",
        "codexBaselineWorkflow": "Codex Public Equity Investing long-short-pitch",
        "codexReviewStatus": "needs_review_after_data_refresh"
      }
    },
    {
      "ticker": "SPCX",
      "displayName": "SpaceX",
      "legalName": "Space Exploration Technologies Corp.",
      "type": "stock",
      "market": "United States",
      "exchange": "Nasdaq",
      "country": "US",
      "currency": "USD",
      "researchPriority": "high",
      "triageStatus": "watchlist_ipo_price_discovery",
      "recommendationEligible": false,
      "backtestEligible": false,
      "horizonRecommendations": {
        "sixMonths": {
          "action": "hold",
          "confidence": "low",
          "rationale": {
            "zh": "实时数据复核 61/100：动量 57、基本面或基金质量 55、风险韧性 90，事件扣分 4。 上市后只有极短价格历史，当前价格仍高于 135 美元 IPO 价，而公司 Q1 仍录得重大净亏损和资本开支压力。短期更适合降低已有暴露、回避新增，等待价格发现和首批上市公司财报。",
            "en": "Live-data review 61/100: momentum 57, fundamentals or fund quality 55, risk resilience 90, and event penalty 4. Post-IPO price history is extremely short, the current price remains above the $135 IPO price, and Q1 still showed a major net loss and heavy capital demands. Reduce existing exposure or avoid new exposure while price discovery and the first public-company reports develop."
          },
          "upgradeTrigger": {
            "zh": "至少两个季度证明 Connectivity 利润增长可以覆盖 Space 与 AI 的亏损和资本投入。",
            "en": "At least two quarters showing Connectivity profit growth can absorb Space and AI losses and capital investment."
          },
          "downgradeTrigger": {
            "zh": "AI 亏损继续加速、Starlink ARPU 下滑快于用户增长贡献，或 IPO 后稀释和解禁压力上升。",
            "en": "AI losses continue to accelerate, Starlink ARPU declines faster than subscriber growth offsets, or post-IPO dilution and lockup pressure increase."
          },
          "liveScore": 61,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 57,
            "fundamentals": 55,
            "risk": 90,
            "eventPenalty": 4
          }
        },
        "oneYear": {
          "action": "hold",
          "confidence": "low",
          "rationale": {
            "zh": "实时数据复核 62/100：动量 57、基本面或基金质量 55、风险韧性 90，事件扣分 4。 Connectivity 业务增长和盈利能力很强，但 Space、AI、数据中心及发射基础设施投入令合并报表波动极大。一年视角应等待 2-4 个公开季度建立估值锚，再决定是否增加暴露。",
            "en": "Live-data review 62/100: momentum 57, fundamentals or fund quality 55, risk resilience 90, and event penalty 4. Connectivity growth and profitability are strong, but Space, AI, data-center, and launch-infrastructure investment make consolidated results highly volatile. Over one year, wait for two to four public quarters to establish a valuation anchor before adding exposure."
          },
          "upgradeTrigger": {
            "zh": "Starlink 用户、ARPU 和利润率形成可持续组合，Starship 进度改善，且自由现金流路径变得可验证。",
            "en": "A durable combination of Starlink subscribers, ARPU, and margins, better Starship execution, and a verifiable free-cash-flow path."
          },
          "downgradeTrigger": {
            "zh": "合并经营亏损继续扩大、资本开支缺乏回报证据，或治理和股权稀释风险恶化。",
            "en": "Further widening of consolidated operating losses, capex without evidence of returns, or worsening governance and dilution risk."
          },
          "liveScore": 62,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 57,
            "fundamentals": 55,
            "risk": 90,
            "eventPenalty": 4
          }
        },
        "twoPlusYears": {
          "action": "hold",
          "confidence": "low",
          "rationale": {
            "zh": "实时数据复核 63/100：动量 57、基本面或基金质量 55、风险韧性 90，事件扣分 4。 Starlink、可重复使用发射和 Starship 具备长期战略价值，但当前缺少足够上市历史、分部自由现金流和可靠估值锚，尚不足以给出长期买进判断。保留观察仓位，等待证据。",
            "en": "Live-data review 63/100: momentum 57, fundamentals or fund quality 55, risk resilience 90, and event penalty 4. Starlink, reusable launch, and Starship have long-duration strategic value, but public history, segment free cash flow, and a reliable valuation anchor remain insufficient for a long-term buy call. Keep only a monitoring position and wait for evidence."
          },
          "upgradeTrigger": {
            "zh": "Connectivity 自由现金流能够稳定资助 Space 与 AI，Starship 单位经济性得到验证，估值回报开始可计算。",
            "en": "Connectivity free cash flow can consistently fund Space and AI, Starship unit economics are proven, and valuation returns become measurable."
          },
          "downgradeTrigger": {
            "zh": "Starship 商业化长期延迟、资本需求持续超预期，或公司治理导致少数股东回报受损。",
            "en": "Persistent Starship commercialization delays, capital needs that repeatedly exceed expectations, or governance that impairs minority shareholder returns."
          },
          "liveScore": 63,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 57,
            "fundamentals": 55,
            "risk": 90,
            "eventPenalty": 4
          }
        }
      },
      "summary": {
        "zh": "新上市的航天、卫星连接与计算基础设施公司；长期叙事强，但上市后价格发现、资本开支和持续亏损使证据仍不完整。",
        "en": "A newly listed space, satellite-connectivity, and compute-infrastructure company; the long-term narrative is powerful, but post-IPO price discovery, capex, and ongoing losses leave the evidence incomplete."
      },
      "whyNow": {
        "zh": "股票于 2026 年 6 月 12 日开始交易，IPO 后首批公开申报和价格历史正在形成。",
        "en": "Shares began trading on June 12, 2026, so the first public filings and post-IPO price history are only beginning to form."
      },
      "watchFor": {
        "zh": [
          "Starlink 用户、ARPU 和利润率",
          "Starship 发射节奏及单位经济性",
          "资本开支、现金消耗和新增融资需求",
          "IPO 后内部人、锁定期和流通股变化"
        ],
        "en": [
          "Starlink users, ARPU, and margins",
          "Starship launch cadence and unit economics",
          "Capex, cash burn, and financing needs",
          "Post-IPO insider, lockup, and float changes"
        ]
      },
      "risks": {
        "zh": [
          "公开交易历史极短，波动和估值锚不足",
          "公司仍有巨额亏损和高资本开支",
          "治理集中、执行风险和监管风险较高"
        ],
        "en": [
          "Very short trading history and limited valuation anchors",
          "Large losses and heavy capital expenditure",
          "Concentrated governance, execution risk, and regulatory exposure"
        ]
      },
      "nextResearch": {
        "zh": "以 S-1 为基础拆分 Space、Connectivity 和 AI 业务，并等待至少一个完整季度的上市公司披露。",
        "en": "Use the S-1 to separate Space, Connectivity, and AI economics, then wait for at least one full quarter of public-company reporting."
      },
      "sources": [
        {
          "label": "SpaceX IPO Closing",
          "url": "https://ir.spacex.com/updates/releases-details/2026/Space-Exploration-Technologies-Corp--Announces-Closing-of-Initial-Public-Offering-Including-Full-Exercise-of-Underwriters-Option-to-Purchase-Additional-Shares-2026-RgoR-Y1Vwh/default.aspx",
          "type": "company_ir"
        },
        {
          "label": "SpaceX Form S-1",
          "url": "https://www.sec.gov/Archives/edgar/data/1181412/000162828026036936/spaceexplorationtechnologi.htm",
          "type": "regulatory_filing"
        },
        {
          "label": "SEC IPO Filing",
          "url": "https://www.sec.gov/Archives/edgar/data/1181412/000162828026042466/spaceexplorationtechnologi.htm",
          "type": "regulatory_filing"
        },
        {
          "label": "SEC Form 8-K",
          "url": "https://www.sec.gov/Archives/edgar/data/1181412/000162828026043288/spaceexplorationtechnologi.htm",
          "type": "regulatory_filing"
        }
      ],
      "priceSignals": {
        "status": "ready",
        "points": 4,
        "price": 158.75,
        "asOf": "2026-07-02",
        "oneWeekReturn": 0.03602430427525438,
        "oneMonthReturn": null,
        "threeMonthReturn": null,
        "maxDrawdown": -0.17172975135135138,
        "annualizedVolatility": 1.1744807094510472
      },
      "newsEvents": {
        "status": "ready",
        "asOf": "2026-07-02T13:38:23.030Z",
        "itemCount": 14,
        "highImpactCount": 1,
        "items": [
          {
            "id": "yahoo-rss-d387a3ba-18e3-358a-950c-b53a6d5f6c09",
            "ticker": "SPCX",
            "kind": "news",
            "category": "earnings",
            "headline": "Dan Ives Says SpaceX's ‘Demand Flywheel’ is Just Getting Started As Wall Street Veteran Roger Altman Questions How Anyone Can Value the Stock: 'I Don't Think...'",
            "summary": "Wedbush analyst Dan Ives has initiated coverage on the newly public Space Exploration Technologies Corp. with a highly bullish outlook, betting on the company’s emerging “demand flywheel” just as the stock prepares for massive passive capital inflows from its upcoming...",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-07-02T11:30:32.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/dan-ives-says-spacexs-demand-113032873.html?.tsrc=rss",
            "relatedTickers": [
              "SPCX"
            ],
            "confidence": "medium",
            "impact": "high",
            "decisionPressure": 91,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 4,
            "actionabilityScore": 4,
            "priority": "high"
          },
          {
            "id": "yahoo-rss-1128e11e-2d5e-3e7e-84c8-4c9d207c40f6",
            "ticker": "SPCX",
            "kind": "news",
            "category": "capital_markets",
            "headline": "Dan Ives' Final Major Call At Wedbush: SpaceX",
            "summary": "After eight years with Webush securities and 25 years as a top Wall Street technology analyst, Dan Ives announced Thursday plans to move on. Well known as a colorful commentator and a longtime Tesla bull, Ives aims to launch what he described as a \"modern merchant bank,\" aimed at combining research, advisory, capital raising and investing under one roof, the analyst told CNBC. On Tuesday, Ives wrapped up his term at Wedbush by initiating coverage of SpaceX with an outperform rating and $190 price target.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-07-02T13:07:12.000Z",
            "sourceUrl": "https://finance.yahoo.com/m/1128e11e-2d5e-3e7e-84c8-4c9d207c40f6/dan-ives%27-final-major-call-at.html?.tsrc=rss",
            "relatedTickers": [
              "SPCX"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 69,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-da65a433-b7ba-3b63-9c9d-2ae1f8f32381",
            "ticker": "SPCX",
            "kind": "news",
            "category": "product",
            "headline": "Dow Jones Futures Rise With Tesla, Jobs Report Ahead",
            "summary": "Stocks fell as Meta buzz hit SpaceX, Micron and many AI stocks. Tesla is near a buy point with deliveries due. The June jobs report also is on tap.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-07-02T12:13:33.000Z",
            "sourceUrl": "https://finance.yahoo.com/m/da65a433-b7ba-3b63-9c9d-2ae1f8f32381/dow-jones-futures-rise-with.html?.tsrc=rss",
            "relatedTickers": [
              "SPCX"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 69,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-d6d7f2bf-5c2f-314b-805e-7a41a08c0ac5",
            "ticker": "SPCX",
            "kind": "news",
            "category": "capital_markets",
            "headline": "Why OpenAI And Anthropic's Road To IPO Is Getting Bumpier",
            "summary": "SpaceX stock has pulled back after its record-setting IPO. Anthropic, meanwhile, is increasingly facing government scrutiny for its ability to prevent its models from being used maliciously. \"They're going to be the 300-pound gorillas in the room,\" Ross Carmel, a partner at capital markets law firm Sichenzia Ross Ference Carmel, told Investor's Business Daily.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-07-02T12:02:57.000Z",
            "sourceUrl": "https://finance.yahoo.com/m/d6d7f2bf-5c2f-314b-805e-7a41a08c0ac5/why-openai-and-anthropic%27s.html?.tsrc=rss",
            "relatedTickers": [
              "SPCX"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 69,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-9a141638-ce2c-3042-bc60-9a63d88ceddd",
            "ticker": "SPCX",
            "kind": "news",
            "category": "product",
            "headline": "SpaceX Stock Falls After Firm Calls Valuation ‘Catastrophic’",
            "summary": "SpaceX stock was down slightly early Thursday after a couple of new Wall Street reports that just aren’t very bullish. Shares of Elon Musk’s rocket and AI company were off 0.4% in premarket trading at $157.54, while futures were down 0.1% and futures were up 0.1%. Overall, 13 analysts have launched coverage of SpaceX stock.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-07-02T11:38:00.000Z",
            "sourceUrl": "https://finance.yahoo.com/m/9a141638-ce2c-3042-bc60-9a63d88ceddd/spacex-stock-falls-after-firm.html?.tsrc=rss",
            "relatedTickers": [
              "SPCX"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 69,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "sec-0001628280-26-045763-spcx-closing8xkjune2026.htm",
            "ticker": "SPCX",
            "kind": "filing_event",
            "category": "corporate_event",
            "headline": "8-K: 8-K",
            "summary": "Official 8-K filing by SPACE EXPLORATION TECHNOLOGIES CORP.",
            "publisher": "U.S. Securities and Exchange Commission",
            "aggregator": null,
            "publishedAt": "2026-06-26T21:00:00.000Z",
            "sourceUrl": "https://www.sec.gov/Archives/edgar/data/1181412/000162828026045763/spcx-closing8xkjune2026.htm",
            "relatedTickers": [
              "SPCX"
            ],
            "confidence": "high",
            "impact": "low",
            "decisionPressure": 58,
            "sourceType": "regulatory_filing",
            "sourceRank": 3,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low",
            "filing": {
              "form": "8-K",
              "accessionNumber": "0001628280-26-045763",
              "filingDate": "2026-06-26"
            }
          },
          {
            "id": "sec-0001628280-26-044955-spcx-pricing8xk.htm",
            "ticker": "SPCX",
            "kind": "filing_event",
            "category": "corporate_event",
            "headline": "8-K: 8-K",
            "summary": "Official 8-K filing by SPACE EXPLORATION TECHNOLOGIES CORP.",
            "publisher": "U.S. Securities and Exchange Commission",
            "aggregator": null,
            "publishedAt": "2026-06-23T21:00:00.000Z",
            "sourceUrl": "https://www.sec.gov/Archives/edgar/data/1181412/000162828026044955/spcx-pricing8xk.htm",
            "relatedTickers": [
              "SPCX"
            ],
            "confidence": "high",
            "impact": "low",
            "decisionPressure": 52,
            "sourceType": "regulatory_filing",
            "sourceRank": 3,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low",
            "filing": {
              "form": "8-K",
              "accessionNumber": "0001628280-26-044955",
              "filingDate": "2026-06-23"
            }
          },
          {
            "id": "sec-0001628280-26-044489-spcx8-kxlaunchseniornotes.htm",
            "ticker": "SPCX",
            "kind": "filing_event",
            "category": "corporate_event",
            "headline": "8-K: 8-K",
            "summary": "Official 8-K filing by SPACE EXPLORATION TECHNOLOGIES CORP.",
            "publisher": "U.S. Securities and Exchange Commission",
            "aggregator": null,
            "publishedAt": "2026-06-22T21:00:00.000Z",
            "sourceUrl": "https://www.sec.gov/Archives/edgar/data/1181412/000162828026044489/spcx8-kxlaunchseniornotes.htm",
            "relatedTickers": [
              "SPCX"
            ],
            "confidence": "high",
            "impact": "low",
            "decisionPressure": 52,
            "sourceType": "regulatory_filing",
            "sourceRank": 3,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low",
            "filing": {
              "form": "8-K",
              "accessionNumber": "0001628280-26-044489",
              "filingDate": "2026-06-22"
            }
          }
        ]
      },
      "holdings": null,
      "fundamentals": {
        "status": "ready",
        "asOf": "2026-07-02T13:38:13.496Z",
        "metrics": {
          "revenueGrowth": null,
          "netIncomeGrowth": null,
          "freeCashFlowMargin": null,
          "debtToEquity": null,
          "fundamentalsScore": 55,
          "riskScore": 90
        }
      },
      "evidenceGaps": [
        "short_price_history"
      ],
      "analysisConfidence": "low",
      "workflowAudit": {
        "workflow": "Comasset deterministic horizon refresh",
        "version": "0.1.29",
        "reviewedAt": "2026-07-02T13:38:25.497Z",
        "classification": "user_selected_watchlist_horizon_actions",
        "recommendationExcluded": true,
        "horizonAnalysisAsOf": "2026-07-02",
        "refreshedAt": "2026-07-02T13:38:25.497Z",
        "codexBaselineWorkflow": "Codex Public Equity Investing long-short-pitch",
        "codexReviewStatus": "needs_review_after_data_refresh"
      }
    },
    {
      "ticker": "AIQ",
      "displayName": "Global X Artificial Intelligence & Technology ETF",
      "type": "etf",
      "market": "United States",
      "exchange": "Nasdaq",
      "country": "US",
      "currency": "USD",
      "researchPriority": "medium",
      "triageStatus": "watchlist_overlap_review",
      "recommendationEligible": false,
      "backtestEligible": false,
      "horizonRecommendations": {
        "sixMonths": {
          "action": "buy",
          "confidence": "medium",
          "rationale": {
            "zh": "实时数据复核 68/100：动量 73、基本面或基金质量 75、风险韧性 67，事件扣分 4。 AIQ 三个月涨幅较大后出现短期回撤，且组合约 79% 暴露于信息技术、对标普 500 Beta 约 1.69。半年视角不宜追涨，已有仓位以持有和控制权重为主。",
            "en": "Live-data review 68/100: momentum 73, fundamentals or fund quality 75, risk resilience 67, and event penalty 4. AIQ has pulled back after a strong three-month advance, while roughly 79% of exposure is in Information Technology and beta versus the S&P 500 is about 1.69. Do not chase over six months; hold existing exposure and control weight."
          },
          "upgradeTrigger": {
            "zh": "主要持仓盈利预期继续上修，同时组合回撤使估值和风险回报重新具有吸引力。",
            "en": "Continued earnings upgrades across top holdings combined with a pullback that restores attractive valuation and risk/reward."
          },
          "downgradeTrigger": {
            "zh": "半导体盈利预期下修、AI 资本开支周期放缓，或主题拥挤导致波动显著高于历史区间。",
            "en": "Semiconductor earnings downgrades, a slowdown in the AI capex cycle, or theme crowding that pushes volatility materially above its historical range."
          },
          "liveScore": 68,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 73,
            "fundamentals": 75,
            "risk": 67,
            "eventPenalty": 4
          }
        },
        "oneYear": {
          "action": "buy",
          "confidence": "medium",
          "rationale": {
            "zh": "实时数据复核 68/100：动量 73、基本面或基金质量 75、风险韧性 67，事件扣分 4。 AI 主题基本面仍强，但 0.68% 费用率、科技集中和与 QQQM/MSFT 的持仓重叠削弱了新增配置的边际价值。一年内先持有并复核组合重叠。",
            "en": "Live-data review 68/100: momentum 73, fundamentals or fund quality 75, risk resilience 67, and event penalty 4. AI fundamentals remain strong, but the 0.68% expense ratio, technology concentration, and overlap with QQQM/MSFT reduce the marginal value of adding exposure. Hold over one year while reviewing portfolio overlap."
          },
          "upgradeTrigger": {
            "zh": "与家庭现有科技持仓重叠可控、指数盈利增长超过估值扩张，且再平衡降低单一主题集中。",
            "en": "Manageable overlap with existing family technology holdings, index earnings growth exceeding multiple expansion, and rebalancing that reduces single-theme concentration."
          },
          "downgradeTrigger": {
            "zh": "持仓重叠过高、相对 QQQM 持续跑输且费用拖累明显，或估值重新脱离盈利增长。",
            "en": "Excessive holdings overlap, persistent underperformance versus QQQM with visible fee drag, or valuation again disconnecting from earnings growth."
          },
          "liveScore": 68,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 73,
            "fundamentals": 75,
            "risk": 67,
            "eventPenalty": 4
          }
        },
        "twoPlusYears": {
          "action": "buy",
          "confidence": "medium",
          "rationale": {
            "zh": "实时数据复核 68/100：动量 73、基本面或基金质量 75、风险韧性 67，事件扣分 4。 两年以上可以把 AIQ 作为分散化的 AI 产业链卫星仓位，覆盖半导体、平台和基础设施；买进应采用分批方式，并受科技总暴露和 0.68% 费用率约束。",
            "en": "Live-data review 68/100: momentum 73, fundamentals or fund quality 75, risk resilience 67, and event penalty 4. Over two-plus years, AIQ can serve as a diversified satellite allocation across semiconductors, platforms, and AI infrastructure. Buy gradually, constrained by total technology exposure and the 0.68% expense ratio."
          },
          "upgradeTrigger": {
            "zh": "指数成分盈利持续复利、主题收入兑现度提高，并且相较宽基或 QQQM 的净费后超额回报稳定。",
            "en": "Sustained constituent earnings compounding, stronger realization of AI-linked revenue, and stable after-fee excess returns versus broad-market funds or QQQM."
          },
          "downgradeTrigger": {
            "zh": "AI 主题商业化低于预期、指数方法持续引入弱 AI 暴露公司，或费用和换手长期侵蚀超额收益。",
            "en": "AI commercialization falls short, the index methodology persistently adds weak AI exposure, or fees and turnover structurally erode excess returns."
          },
          "liveScore": 68,
          "analysisProvider": "comasset_deterministic_horizon_analysis_v1",
          "analysisInputs": {
            "momentum": 73,
            "fundamentals": 75,
            "risk": 67,
            "eventPenalty": 4
          }
        }
      },
      "expenseRatio": 0.0068,
      "indexName": "Indxx Artificial Intelligence & Big Data Index",
      "summary": {
        "zh": "覆盖人工智能软件、平台、半导体和数据基础设施的主题 ETF；比单一个股分散，但费用和科技集中度明显高于宽基指数。",
        "en": "A thematic ETF spanning AI software, platforms, semiconductors, and data infrastructure; more diversified than one stock, but cost and technology concentration are materially above broad-market funds."
      },
      "whyNow": {
        "zh": "AI 主题仍处于高关注阶段，重点不是预测主题是否继续上涨，而是核对持仓暴露、估值和家庭组合重叠。",
        "en": "AI remains a high-attention theme; the useful question is not whether the theme keeps rising, but whether holdings, valuation, and family-portfolio overlap justify the exposure."
      },
      "watchFor": {
        "zh": [
          "前十大持仓和半导体权重",
          "与 QQQM、MSFT 和现有科技持仓的重叠",
          "费用率、跟踪差异和再平衡变化"
        ],
        "en": [
          "Top-10 and semiconductor concentration",
          "Overlap with QQQM, MSFT, and existing technology holdings",
          "Expense ratio, tracking difference, and rebalance changes"
        ]
      },
      "risks": {
        "zh": [
          "0.68% 费用率显著高于宽基 ETF",
          "主题和估值拥挤风险",
          "指数方法可能纳入 AI 收入暴露较弱的公司"
        ],
        "en": [
          "The 0.68% expense ratio is high versus broad-market ETFs",
          "Theme and valuation crowding risk",
          "Index methodology may include companies with weak direct AI revenue exposure"
        ]
      },
      "nextResearch": {
        "zh": "用真实持仓计算与家庭组合、QQQM 和 VTI 的重叠率，再决定是否值得继续深入。",
        "en": "Use actual holdings to calculate overlap with the family portfolio, QQQM, and VTI before deciding whether deeper work is warranted."
      },
      "sources": [
        {
          "label": "Global X AIQ Fund Page",
          "url": "https://www.globalxetfs.com/funds/aiq",
          "type": "issuer"
        },
        {
          "label": "SEC N-PORT Filing",
          "url": "https://www.sec.gov/Archives/edgar/data/1432353/000175272425016356/0001752724-25-016356-index.html",
          "type": "regulatory_filing"
        }
      ],
      "priceSignals": {
        "status": "ready",
        "points": 79,
        "price": 63.560001,
        "asOf": "2026-07-02",
        "oneWeekReturn": 0.006492462185511805,
        "oneMonthReturn": 0.016634692898272574,
        "threeMonthReturn": 0.2874215573713097,
        "maxDrawdown": -0.23602912025418443,
        "annualizedVolatility": 0.26583147591395206
      },
      "newsEvents": {
        "status": "ready",
        "asOf": "2026-07-02T13:38:23.030Z",
        "itemCount": 8,
        "highImpactCount": 1,
        "items": [
          {
            "id": "yahoo-rss-a47c21ff-7d23-31c9-be49-504d7d96bbe7",
            "ticker": "AIQ",
            "kind": "news",
            "category": "regulatory",
            "headline": "MoneyMasters Podcast 6-25-26- Six Experts Sound Off on AI, Tech, Hot IPOs, Top Stocks",
            "summary": "With key questions swirling on AI and tech stocks, hot IPOs, Federal Reserve policy, and ongoing tensions in the Middle East, where is an investor to turn? We brought together a powerful roster of six experts this week to share their advice and recommendations...LIVE!",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-25T16:32:00.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/moneymasters-podcast-6-25-26-163200759.html?.tsrc=rss",
            "relatedTickers": [
              "AIQ"
            ],
            "confidence": "medium",
            "impact": "high",
            "decisionPressure": 91,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 4,
            "actionabilityScore": 4,
            "priority": "high"
          },
          {
            "id": "yahoo-rss-23867082-ebce-34c8-aaa0-6b95fc080d4c",
            "ticker": "AIQ",
            "kind": "news",
            "category": "capital_markets",
            "headline": "Tech ETFs to Buy as SK Hynix Preps Massive $29 Billion Nasdaq Debut",
            "summary": "SK Hynix surges after unveiling a $29.4 billion Nasdaq listing. See three tech ETFs with top exposure ahead of its July 10 US debut.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-25T14:17:00.000Z",
            "sourceUrl": "https://finance.yahoo.com/technology/articles/tech-etfs-buy-sk-hynix-141700644.html?.tsrc=rss",
            "relatedTickers": [
              "AIQ"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 69,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-e0d39319-6aa6-346e-b692-d10f489b3a7c",
            "ticker": "AIQ",
            "kind": "news",
            "category": "product",
            "headline": "Beyond Mag 7: MANGOS or Big-10 ETFs Will Likely Rule Ahead",
            "summary": "Wall Street's AI trade is expanding beyond the Mag-7. Discover emergent players and the ETFs best positioned to benefit.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-24T14:00:00.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/beyond-mag-7-mangos-big-140000492.html?.tsrc=rss",
            "relatedTickers": [
              "AIQ"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 63,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-f9b8a052-bde2-32db-9670-a1100c3db712",
            "ticker": "AIQ",
            "kind": "news",
            "category": "product",
            "headline": "MoneyMasters Podcast 6-18-26- Armani on Why the AI Boom Is Different",
            "summary": "In this timely episode, Sydney Armani shares his perspective on the explosive growth of Artificial Intelligence – and why he believes today’s AI boom is fundamentally different from the Dot-Com Bubble of the late 1990s.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-18T16:32:00.000Z",
            "sourceUrl": "https://finance.yahoo.com/technology/ai/articles/moneymasters-podcast-6-18-26-163200962.html?.tsrc=rss",
            "relatedTickers": [
              "AIQ"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 63,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-5e0533b0-72a4-39ef-b930-7db15783ac1a",
            "ticker": "AIQ",
            "kind": "news",
            "category": "product",
            "headline": "Don't Fear Higher Rates: Play AI ETFs as IPO Race Heats Up",
            "summary": "SpaceX's blockbuster debut and the looming IPOs of Anthropic, OpenAI and Perplexity could fuel AI ETFs, potentially outweighing concerns over higher-for-longer interest rates.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-17T16:00:00.000Z",
            "sourceUrl": "https://finance.yahoo.com/technology/ai/articles/dont-fear-higher-rates-play-160000826.html?.tsrc=rss",
            "relatedTickers": [
              "AIQ"
            ],
            "confidence": "medium",
            "impact": "medium",
            "decisionPressure": 63,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 3,
            "actionabilityScore": 3,
            "priority": "medium"
          },
          {
            "id": "yahoo-rss-f8c5a055-436e-37ac-b61b-0dcecd435715",
            "ticker": "AIQ",
            "kind": "news",
            "category": "other",
            "headline": "Quantum Computing Just Hit Commercial Viability and Trump’s $2 Billion Quantum Push Has These 3 ETFs Sitting on Top of the Trade",
            "summary": "The Commerce Department’s $2 billion in planned CHIPS R&D funding for nine quantum companies, announced in May, gave the quantum computing trade something it lacked for a decade: a federal balance sheet behind it. Three exchange-traded funds capture the trade from different angles. The Defiance Quantum ETF (NASDAQ:QTUM) is the closest thing to a pure-play. ... Quantum Computing Just Hit Commercial Viability and Trump’s $2 Billion Quantum Push Has These 3 ETFs Sitting on Top of the Trade",
            "publisher": "247wallst.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-30T13:54:41.000Z",
            "sourceUrl": "https://247wallst.com/investing/2026/06/30/quantum-computing-just-hit-commercial-viability-and-trumps-2-billion-quantum-push-has-these-3-etfs-sitting-on-top-of-the-trade/?.tsrc=rss",
            "relatedTickers": [
              "AIQ"
            ],
            "confidence": "medium",
            "impact": "low",
            "decisionPressure": 49,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low"
          },
          {
            "id": "yahoo-rss-cd74b01e-679b-3592-a815-629dd8f323bb",
            "ticker": "AIQ",
            "kind": "news",
            "category": "other",
            "headline": "Update: Technology Helps Push US Equity Indexes Lower; Israel-Lebanon Sign 'Framework Agreement'",
            "summary": "(Updates with index/price moves, macroeconomic data, and political news from the first paragraph.)",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-26T20:30:16.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/technology-helps-push-us-equity-203016579.html?.tsrc=rss",
            "relatedTickers": [
              "AIQ"
            ],
            "confidence": "medium",
            "impact": "low",
            "decisionPressure": 49,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low"
          },
          {
            "id": "yahoo-rss-72f27af7-192f-3a8e-99f3-6c51ba0157fb",
            "ticker": "AIQ",
            "kind": "news",
            "category": "other",
            "headline": "Market Minute 6-24-26- Tech Selloff Tops $2.7 Trillion",
            "summary": "After a vicious multiday selloff in the tech sector, equities are trying to stabilize here. Gold, silver, Bitcoin, and crude oil are all dropping, though. Treasuries and the dollar are rallying.",
            "publisher": "finance.yahoo.com",
            "aggregator": "Yahoo Finance",
            "publishedAt": "2026-06-24T14:15:00.000Z",
            "sourceUrl": "https://finance.yahoo.com/markets/stocks/articles/market-minute-6-24-26-141500987.html?.tsrc=rss",
            "relatedTickers": [
              "AIQ"
            ],
            "confidence": "medium",
            "impact": "low",
            "decisionPressure": 43,
            "sourceType": "ticker_news_feed",
            "sourceRank": 5,
            "evidenceLabel": "Fact",
            "timingConfidence": "confirmed",
            "dateType": "hard_date",
            "lastChecked": "2026-07-02T13:38:23.030Z",
            "materialityScore": 2,
            "actionabilityScore": 2,
            "priority": "low"
          }
        ]
      },
      "holdings": {
        "status": "ready",
        "asOf": "2026-02-28",
        "sourceType": "sec_nport",
        "expenseRatio": 0.0068,
        "holdingsCount": 89,
        "top10Weight": 0.35635462706885,
        "sectorExposure": {
          "Equity": 0.9990231374842398,
          "RA": 0.01078825668106,
          "DFE": 1.4291780000000001e-8
        },
        "topHoldings": [
          {
            "ticker": "N/A",
            "name": "Samsung Electronics Co., Ltd.",
            "weight": 0.04582235931843,
            "sector": "Equity",
            "country": "KR",
            "shares": 2374228,
            "marketValue": 357330804.3,
            "cusip": "N/A",
            "isin": "KR7005930003",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "N/A",
            "name": "SK hynix Inc.",
            "weight": 0.04530084592743,
            "sector": "Equity",
            "country": "KR",
            "shares": 478954,
            "marketValue": 353263951.3,
            "cusip": "N/A",
            "isin": "KR7000660001",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "64110L106",
            "name": "NETFLIX, INC.",
            "weight": 0.03634436938771,
            "sector": "Equity",
            "country": "US",
            "shares": 2944927,
            "marketValue": 283419774.5,
            "cusip": "64110L106",
            "isin": "US64110L1061",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "874039100",
            "name": "Taiwan Semiconductor Manufacturing Co., Ltd.",
            "weight": 0.03609432701878,
            "sector": "Equity",
            "country": "US",
            "shares": 751428,
            "marketValue": 281469900.2,
            "cusip": "874039100",
            "isin": "US8740391003",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "17275R102",
            "name": "CISCO SYSTEMS, INC.",
            "weight": 0.03372482396428,
            "sector": "Equity",
            "country": "US",
            "shares": 3309742,
            "marketValue": 262992099.3,
            "cusip": "17275R102",
            "isin": "US17275R1023",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "N/A",
            "name": "APPLE INC.",
            "weight": 0.03355965785796,
            "sector": "Equity",
            "country": "US",
            "shares": 990628,
            "marketValue": 261704105,
            "cusip": "N/A",
            "isin": "US0378331005",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "595112103",
            "name": "MICRON TECHNOLOGY, INC.",
            "weight": 0.03272249898438,
            "sector": "Equity",
            "country": "US",
            "shares": 618803,
            "marketValue": 255175793.1,
            "cusip": "595112103",
            "isin": "US5951121038",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "30303M102",
            "name": "META PLATFORMS, INC.",
            "weight": 0.031568680737219995,
            "sector": "Equity",
            "country": "US",
            "shares": 379799,
            "marketValue": 246178115.8,
            "cusip": "30303M102",
            "isin": "US30303M1027",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "11135F101",
            "name": "BROADCOM INC.",
            "weight": 0.03097401589011,
            "sector": "Equity",
            "country": "US",
            "shares": 755878,
            "marketValue": 241540814.9,
            "cusip": "11135F101",
            "isin": "US11135F1012",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          },
          {
            "ticker": "67066G104",
            "name": "NVIDIA CORPORATION",
            "weight": 0.030243047982550002,
            "sector": "Equity",
            "country": "US",
            "shares": 1331004,
            "marketValue": 235840598.8,
            "cusip": "67066G104",
            "isin": "US67066G1040",
            "identifierType": "CUSIP",
            "assetCategory": "EC"
          }
        ]
      },
      "fundamentals": {
        "status": "missing"
      },
      "evidenceGaps": [],
      "analysisConfidence": "medium",
      "workflowAudit": {
        "workflow": "Comasset deterministic horizon refresh",
        "version": "0.1.29",
        "reviewedAt": "2026-07-02T13:38:25.497Z",
        "classification": "user_selected_watchlist_horizon_actions",
        "recommendationExcluded": true,
        "horizonAnalysisAsOf": "2026-07-02",
        "refreshedAt": "2026-07-02T13:38:25.497Z",
        "codexBaselineWorkflow": "Codex Public Equity Investing long-short-pitch",
        "codexReviewStatus": "needs_review_after_data_refresh"
      }
    }
  ]
};
