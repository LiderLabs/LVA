// Sample data modeled on what a Debt Management Office actually tracks,
// so a new user sees a relevant, working dashboard immediately instead
// of an empty canvas. All figures are illustrative, in local-currency
// billions unless noted.

export const debtByInstrument = {
  columns: ["instrument", "amount"],
  rows: [
    { instrument: "Treasury bonds", amount: 218 },
    { instrument: "Treasury bills", amount: 64 },
    { instrument: "External loans", amount: 141 },
    { instrument: "Eurobonds", amount: 36 },
  ],
};

export const debtByCurrency = {
  columns: ["currency", "amount"],
  rows: [
    { currency: "Local currency", amount: 282 },
    { currency: "USD", amount: 121 },
    { currency: "EUR", amount: 40 },
    { currency: "Other", amount: 16 },
  ],
};

export const maturityProfile = {
  columns: ["year", "principal_due"],
  rows: [
    { year: "2026", principal_due: 38 },
    { year: "2027", principal_due: 44 },
    { year: "2028", principal_due: 29 },
    { year: "2029", principal_due: 51 },
    { year: "2030", principal_due: 33 },
    { year: "2031", principal_due: 22 },
  ],
};

export const debtStockMovement = {
  columns: ["label", "value"],
  rows: [
    { label: "Opening stock 2025", value: 420 },
    { label: "New borrowing", value: 65 },
    { label: "Repayments", value: -38 },
    { label: "FX revaluation", value: 12 },
    { label: "Closing stock 2026", value: 459 },
  ],
};

export const debtStockTrend = {
  columns: ["year", "domestic", "external"],
  rows: [
    { year: "2022", domestic: 178, external: 156 },
    { year: "2023", domestic: 201, external: 163 },
    { year: "2024", domestic: 224, external: 171 },
    { year: "2025", domestic: 251, external: 169 },
    { year: "2026", domestic: 282, external: 177 },
  ],
};

export const riskIndicators = {
  columns: ["indicator", "score"],
  rows: [
    { indicator: "Refinancing risk", score: 58 },
    { indicator: "FX exposure", score: 47 },
    { indicator: "Interest rate risk", score: 41 },
    { indicator: "Rollover concentration", score: 63 },
    { indicator: "Contingent liabilities", score: 35 },
  ],
};

// Who actually holds the debt -- mirrors Bloomberg's DEBT (Sovereign
// Debt Ownership) function. Distinct from "by instrument": instrument
// is *what form* the debt takes (bonds, bills, loans); holder is *who*
// is actually owed the money.
export const debtByHolder = {
  columns: ["holder", "amount"],
  rows: [
    { holder: "Domestic banks", amount: 158 },
    { holder: "Central bank", amount: 52 },
    { holder: "Non-bank public (pensions, insurers)", amount: 71 },
    { holder: "Foreign investors", amount: 121 },
    { holder: "Multilateral & bilateral creditors", amount: 57 },
  ],
};

// Government yield curve -- mirrors Bloomberg's ICVS function.
export const yieldCurve = {
  columns: ["maturity", "yield"],
  rows: [
    { maturity: "3M", yield: 6.2 },
    { maturity: "6M", yield: 6.6 },
    { maturity: "1Y", yield: 7.0 },
    { maturity: "2Y", yield: 7.3 },
    { maturity: "5Y", yield: 7.8 },
    { maturity: "10Y", yield: 8.4 },
    { maturity: "20Y", yield: 8.9 },
  ],
};

// Recent auction results -- mirrors Bloomberg's AUCR function.
export const auctionResults = {
  columns: ["date", "security", "offered", "allotted", "bids", "yieldPct"],
  rows: [
    { date: "2026-01-15", security: "91-day T-bill", offered: 50, allotted: 48, bids: 70, yieldPct: 6.8 },
    { date: "2026-02-12", security: "182-day T-bill", offered: 40, allotted: 40, bids: 84, yieldPct: 7.1 },
    { date: "2026-03-10", security: "5-year bond", offered: 60, allotted: 52, bids: 54, yieldPct: 8.4 },
    { date: "2026-04-14", security: "10-year bond", offered: 70, allotted: 70, bids: 126, yieldPct: 9.0 },
  ],
};

// A preset combination of widgets that turns straight into a working
// dashboard via the "Debt overview" template button.
export function buildDebtOverviewWidgets() {
  return [
    {
      id: `w${Date.now()}_1`,
      type: "kpi",
      data: { title: "Total public debt", value: "N459.0bn", delta: "+9.3% YoY", positive: false },
    },
    {
      id: `w${Date.now()}_2`,
      type: "kpi",
      data: { title: "Weighted avg. interest rate", value: "7.4%", delta: "+0.3pp", positive: false },
    },
    {
      id: `w${Date.now()}_3`,
      type: "waterfall",
      data: { title: "Debt stock movement, 2025-2026", data: debtStockMovement.rows },
    },
    {
      id: `w${Date.now()}_4`,
      type: "stackedBar",
      data: {
        title: "Debt stock by source, 2022-2026",
        data: debtStockTrend.rows.map((r) => ({ label: r.year, domestic: r.domestic, external: r.external })),
        seriesKeys: [
          { key: "domestic", label: "Domestic" },
          { key: "external", label: "External" },
        ],
      },
    },
    {
      id: `w${Date.now()}_5`,
      type: "pie",
      data: {
        title: "Debt by instrument",
        data: debtByInstrument.rows.map((r) => ({ name: r.instrument, value: r.amount })),
      },
    },
    {
      id: `w${Date.now()}_6`,
      type: "pie",
      data: {
        title: "Currency composition",
        data: debtByCurrency.rows.map((r) => ({ name: r.currency, value: r.amount })),
      },
    },
    {
      id: `w${Date.now()}_7`,
      type: "bar",
      data: {
        title: "Maturity profile — principal due",
        data: maturityProfile.rows.map((r) => ({ label: r.year, value: r.principal_due })),
      },
    },
    {
      id: `w${Date.now()}_8`,
      type: "radar",
      data: {
        title: "Risk indicator profile",
        data: riskIndicators.rows.map((r) => ({ axis: r.indicator, value: r.score })),
      },
    },
    {
      id: `w${Date.now()}_9`,
      type: "pie",
      data: {
        title: "Debt by holder",
        data: debtByHolder.rows.map((r) => ({ name: r.holder, value: r.amount })),
      },
    },
    {
      id: `w${Date.now()}_10`,
      type: "yieldCurve",
      data: {
        title: "Government yield curve",
        data: yieldCurve.rows.map((r) => ({ label: r.maturity, value: r.yield })),
      },
    },
    {
      id: `w${Date.now()}_11`,
      type: "auction",
      data: {
        title: "T-bill & bond auctions",
        rows: auctionResults.rows.map((r) => ({
          date: r.date,
          security: r.security,
          offered: r.offered,
          allotted: r.allotted,
          yieldPct: r.yieldPct,
          bidToCover: r.bids / r.offered,
        })),
      },
    },
  ];
}

// When the user has already imported their own debt dataset, "Debt
// overview template" can do something more useful than dumping in
// unrelated sample numbers: it tries to recognize the standard debt
// columns by name (total debt, domestic/external split, instrument,
// currency, year) and builds the same set of standard widgets bound
// to their real data wherever a confident match is found. Anything it
// can't confidently map is left out, rather than guessed at -- the
// Inspector's "not bound to imported data" hint makes it obvious which
// widgets, if any, are still just placeholders.
function findCol(columns, patterns) {
  return columns.find((c) => patterns.some((p) => p.test(c))) || null;
}

export function buildSmartDebtOverview(dataset, datasetId) {
  const cols = dataset.columns;
  const timeCol = findCol(cols, [/^year$/i, /date/i, /period/i]);
  const totalCol = findCol(cols, [/total.*debt/i, /debt.*total/i]);
  const domesticCol = findCol(cols, [/domestic/i]);
  const externalCol = findCol(cols, [/external/i, /foreign/i]);
  const instrumentCol = findCol(cols, [/instrument/i, /category/i, /type/i]);
  const instrumentValueCol = findCol(cols, [/amount/i]) || totalCol;
  const currencyCol = findCol(cols, [/currency/i]);

  const widgets = [];
  let idCounter = 0;
  const nextId = () => `w${Date.now()}_${idCounter++}`;

  if (totalCol) {
    const total = dataset.rows.reduce((a, r) => a + (Number(r[totalCol]) || 0), 0);
    widgets.push({
      id: nextId(), type: "kpi",
      data: { title: "Total debt (from your data)", value: total.toLocaleString(), delta: "", positive: true },
      source: { datasetId, mapping: { valueCol: totalCol, aggregate: "sum" } },
    });
  }

  if (timeCol && totalCol) {
    widgets.push({
      id: nextId(), type: "line",
      data: {
        title: "Total debt over time",
        data: dataset.rows.map((r) => ({ label: String(r[timeCol]), value: Number(r[totalCol]) || 0 })),
      },
      source: { datasetId, mapping: { labelCol: timeCol, valueCol: totalCol } },
    });
  }

  if (timeCol && domesticCol && externalCol) {
    widgets.push({
      id: nextId(), type: "stackedBar",
      data: {
        title: "Debt by source over time",
        data: dataset.rows.map((r) => ({ label: String(r[timeCol]), [domesticCol]: Number(r[domesticCol]) || 0, [externalCol]: Number(r[externalCol]) || 0 })),
        seriesKeys: [{ key: domesticCol, label: "Domestic" }, { key: externalCol, label: "External" }],
      },
      source: { datasetId, mapping: { labelCol: timeCol, valueCols: [domesticCol, externalCol] } },
    });
  }

  if (instrumentCol && instrumentValueCol) {
    const grouped = {};
    dataset.rows.forEach((r) => {
      const key = String(r[instrumentCol]);
      grouped[key] = (grouped[key] || 0) + (Number(r[instrumentValueCol]) || 0);
    });
    widgets.push({
      id: nextId(), type: "pie",
      data: { title: "Debt by instrument (from your data)", data: Object.entries(grouped).map(([name, value]) => ({ name, value })) },
      source: { datasetId, mapping: { nameCol: instrumentCol, valueCol: instrumentValueCol } },
    });
  }

  if (currencyCol && instrumentValueCol) {
    const grouped = {};
    dataset.rows.forEach((r) => {
      const key = String(r[currencyCol]);
      grouped[key] = (grouped[key] || 0) + (Number(r[instrumentValueCol]) || 0);
    });
    widgets.push({
      id: nextId(), type: "pie",
      data: { title: "Currency composition (from your data)", data: Object.entries(grouped).map(([name, value]) => ({ name, value })) },
      source: { datasetId, mapping: { nameCol: currencyCol, valueCol: instrumentValueCol } },
    });
  }

  const matchedCount = widgets.length;
  return { widgets, matchedCount, totalPossible: 5 };
}
