window.comassetConfig = {
  familyProfile: {
    baseCurrency: "USD",
    riskProfile: "balanced_growth",
    initialCapital: 10000,
    monthlyContribution: 500,
    defaultBenchmark: "SPY",
    defaultLanguage: "zh",
  },
  familyMembers: [
    {
      id: "thomas",
      name: "Thomas",
      role: "admin",
      permissions: ["view", "edit_notes", "change_member", "run_pipeline"],
    },
    {
      id: "family-reviewer",
      name: "Family Reviewer",
      role: "reviewer",
      permissions: ["view", "edit_notes", "change_member"],
    },
    {
      id: "family-viewer",
      name: "Family Viewer",
      role: "viewer",
      permissions: ["view", "change_member"],
    },
  ],
  accessControl: {
    mode: "local_family_access",
    storage: "browser_localStorage",
    roles: {
      admin: {
        labelZh: "管理员",
        labelEn: "Admin",
        descriptionZh: "可查看研究、编辑家庭备注、切换成员，并主动运行数据刷新与分析管线。",
        descriptionEn: "Can view research, edit family notes, switch members, and run the data refresh and analysis pipeline.",
        permissions: ["view", "edit_notes", "change_member", "run_pipeline"],
      },
      reviewer: {
        labelZh: "复核成员",
        labelEn: "Reviewer",
        descriptionZh: "可查看研究、编辑自己的家庭备注，并切换到其他家庭成员视角。",
        descriptionEn: "Can view research, edit their own family notes, and switch family-member context.",
        permissions: ["view", "edit_notes", "change_member"],
      },
      viewer: {
        labelZh: "只读成员",
        labelEn: "Viewer",
        descriptionZh: "只能查看研究和切换成员，不能编辑家庭备注或运行数据管线。",
        descriptionEn: "Can view research and switch member context, but cannot edit notes or run the data pipeline.",
        permissions: ["view", "change_member"],
      },
    },
    permissions: {
      view: { labelZh: "查看研究", labelEn: "View research" },
      edit_notes: { labelZh: "编辑备注", labelEn: "Edit notes" },
      change_member: { labelZh: "切换成员", labelEn: "Switch member" },
      run_pipeline: { labelZh: "运行数据管线", labelEn: "Run pipeline" },
    },
    auditEvents: ["member_switch", "note_save", "recommendations_refresh", "watchlist_refresh"],
  },
  weeklySnapshot: {
    snapshotId: "2026-W26-scored",
    asOf: "2026-06-24",
    generatedAt: "2026-06-25T13:40:30.049Z",
    dataCutoff: "2026-06-24",
    updateCadence: "weekly",
  },
  targetAllocation: {
    "US Equity": { min: 0.55, target: 0.68, max: 0.78 },
    "International Equity": { min: 0, target: 0.05, max: 0.15 },
    "Cash / T-Bills": { min: 0.08, target: 0.15, max: 0.22 },
    Other: { min: 0, target: 0.12, max: 0.2 },
  },
  simulationDefaults: {
    rebalance: "monthly",
    strategy: "mixed",
  },
};
