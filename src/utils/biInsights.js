// A small, honest rule-based insights engine -- not a language model,
// just pattern detection over columns it can recognize by name, plus
// a table of threshold-triggered recommendations. Follows the standard
// BI framing: descriptive (what happened), diagnostic (why), and
// decision-oriented (what to do about it). Every bullet it produces is
// traceable to a specific rule, not a black box.

function findColumn(columns, patterns) {
  return columns.find((c) => patterns.some((p) => p.test(c))) || null;
}

function pct(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

// Attempts to identify the standard debt-dataset columns by name.
// Anything it can't find is simply left out of the relevant insights
// rather than guessed at.
export function detectColumns(columns) {
  return {
    time: findColumn(columns, [/^year$/i, /date/i, /period/i]),
    totalDebt: findColumn(columns, [/total.*debt/i, /debt.*total/i, /^total_debt$/i]),
    domesticDebt: findColumn(columns, [/domestic/i]),
    externalDebt: findColumn(columns, [/external/i, /foreign/i]),
    gdp: findColumn(columns, [/gdp/i]),
    interestRate: findColumn(columns, [/interest.*rate/i, /^rate$/i, /wair/i]),
    debtService: findColumn(columns, [/debt.*service/i, /service.*debt/i]),
    revenue: findColumn(columns, [/revenue/i]),
    maturity: findColumn(columns, [/maturity/i, /years.*to.*maturity/i, /watm/i]),
  };
}

function sum(rows, col) {
  return rows.reduce((a, r) => a + (Number(r[col]) || 0), 0);
}

export function generateDebtInsights(dataset) {
  if (!dataset || !dataset.rows.length) return { descriptive: [], diagnostic: [], decision: [], detected: {} };

  const cols = detectColumns(dataset.columns);
  const rows = cols.time ? [...dataset.rows].sort((a, b) => String(a[cols.time]).localeCompare(String(b[cols.time]))) : dataset.rows;
  const latest = rows[rows.length - 1];
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;

  const descriptive = [];
  const diagnostic = [];
  const decision = [];

  // ---------- descriptive: what happened ----------
  if (cols.totalDebt && previous) {
    const cur = Number(latest[cols.totalDebt]) || 0;
    const prev = Number(previous[cols.totalDebt]) || 0;
    if (prev !== 0) {
      const change = ((cur - prev) / Math.abs(prev)) * 100;
      descriptive.push(`Total debt ${change >= 0 ? "increased" : "decreased"} by ${pct(change)} from ${previous[cols.time]} to ${latest[cols.time]}.`);
    }
  } else if (cols.totalDebt) {
    descriptive.push(`Total debt across the imported data sums to ${sum(rows, cols.totalDebt).toLocaleString()}.`);
  }

  if (cols.totalDebt && cols.gdp) {
    const ratio = sum(rows, cols.gdp) === 0 ? null : (sum(rows, cols.totalDebt) / sum(rows, cols.gdp)) * 100;
    if (ratio !== null) descriptive.push(`Debt-to-GDP stands at ${ratio.toFixed(1)}%.`);
  }

  if (cols.debtService && cols.revenue) {
    const ratio = sum(rows, cols.revenue) === 0 ? null : (sum(rows, cols.debtService) / sum(rows, cols.revenue)) * 100;
    if (ratio !== null) descriptive.push(`Debt service consumes ${ratio.toFixed(1)}% of government revenue.`);
  }

  // ---------- diagnostic: composition shifts that help explain "why" ----------
  if (cols.externalDebt && cols.domesticDebt && previous) {
    const curTotal = (Number(latest[cols.externalDebt]) || 0) + (Number(latest[cols.domesticDebt]) || 0);
    const prevTotal = (Number(previous[cols.externalDebt]) || 0) + (Number(previous[cols.domesticDebt]) || 0);
    if (curTotal > 0 && prevTotal > 0) {
      const curExtShare = ((Number(latest[cols.externalDebt]) || 0) / curTotal) * 100;
      const prevExtShare = ((Number(previous[cols.externalDebt]) || 0) / prevTotal) * 100;
      const shift = curExtShare - prevExtShare;
      if (Math.abs(shift) >= 2) {
        diagnostic.push(
          `External debt's share of the total moved from ${prevExtShare.toFixed(1)}% to ${curExtShare.toFixed(1)}% — ${shift > 0 ? "increased reliance on foreign financing" : "a shift toward domestic financing"} is a likely contributor to the overall change. Drill into the relevant chart to confirm which specific instruments moved.`
        );
      }
    }
  }

  if (cols.interestRate && previous) {
    const cur = Number(latest[cols.interestRate]) || 0;
    const prev = Number(previous[cols.interestRate]) || 0;
    if (cur - prev >= 0.3) {
      diagnostic.push(`The weighted interest rate rose ${(cur - prev).toFixed(1)} percentage points — rising rates on existing or new borrowing may be pushing debt service higher.`);
    }
  }

  // ---------- decision: threshold-triggered recommendations ----------
  if (cols.externalDebt && cols.domesticDebt) {
    const total = sum(rows, cols.externalDebt) + sum(rows, cols.domesticDebt);
    const extShare = total === 0 ? 0 : (sum(rows, cols.externalDebt) / total) * 100;
    if (extShare > 55) {
      decision.push(`External debt makes up ${extShare.toFixed(0)}% of the portfolio — consider increasing domestic issuance to reduce exchange-rate exposure.`);
    }
  }

  if (cols.maturity) {
    const avgMaturity = rows.reduce((a, r) => a + (Number(r[cols.maturity]) || 0), 0) / rows.length;
    if (avgMaturity > 0 && avgMaturity < 5) {
      decision.push(`Average time to maturity is short (${avgMaturity.toFixed(1)} years) — issuing more long-tenor bonds would reduce refinancing risk.`);
    }
  }

  if (cols.debtService && cols.revenue) {
    const ratio = sum(rows, cols.revenue) === 0 ? 0 : (sum(rows, cols.debtService) / sum(rows, cols.revenue)) * 100;
    if (ratio > 25) {
      decision.push(`Debt service is above 25% of revenue — this leaves limited room for new borrowing without straining the budget.`);
    }
  }

  if (decision.length === 0 && (descriptive.length > 0 || diagnostic.length > 0)) {
    decision.push("No threshold-triggered risks detected from the columns available — the portfolio looks within typical ranges based on what could be read from this data.");
  }

  return { descriptive, diagnostic, decision, detected: cols };
}
