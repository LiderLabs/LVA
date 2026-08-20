import { evaluate } from "mathjs";

// The formula engine works on one dataset at a time. It exposes a small
// set of aggregate helpers (sum, average, weightedAverage, growth) that
// a user can combine in a single expression, e.g.:
//
//   weightedAverage(interest_rate, principal)
//   growth(debt_2025, debt_2024)
//   sum(external) / (sum(domestic) + sum(external)) * 100
//
// Column names become variables automatically. Any column with spaces
// is exposed under a safe underscored alias as well.

function buildScope(dataset, industry) {
  const scope = {};

  dataset.columns.forEach((col) => {
    const values = dataset.rows.map((r) => Number(r[col]) || 0);
    const safeName = col.replace(/[^a-zA-Z0-9_]/g, "_");
    scope[safeName] = values;
  });

  scope.sum = (arr) => arr.reduce((a, b) => a + b, 0);
  scope.average = (arr) => (arr.length ? scope.sum(arr) / arr.length : 0);
  scope.min = (arr) => Math.min(...arr);
  scope.max = (arr) => Math.max(...arr);
  scope.count = (arr) => arr.length;
  scope.weightedAverage = (values, weights) => {
    const totalWeight = scope.sum(weights);
    if (!totalWeight) return 0;
    const weighted = values.reduce((acc, v, i) => acc + v * (weights[i] || 0), 0);
    return weighted / totalWeight;
  };
  // growth(current, previous) as a percentage
  scope.growth = (a, b) => (b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100);

  if (industry === "pdmo") addDebtManagementFunctions(scope);

  return scope;
}

// The ten debt-management analytics functions, only exposed inside the
// PDMO dashboard -- these are the standard ratios and risk indicators
// a debt office actually reports, not generic spreadsheet math. Each
// one takes whole dataset columns (arrays) the same way sum()/average()
// do, so a real column can be plugged straight in without pre-aggregating.
function addDebtManagementFunctions(scope) {
  const total = (arr) => arr.reduce((a, b) => a + b, 0);

  // Total debt as a percentage of GDP -- the single most-quoted debt figure.
  scope.DebtToGDP = (debt, gdp) => (total(gdp) === 0 ? 0 : (total(debt) / total(gdp)) * 100);

  // Debt service (principal + interest due) as a percentage of government revenue.
  scope.DebtServiceRatio = (debtService, revenue) => (total(revenue) === 0 ? 0 : (total(debtService) / total(revenue)) * 100);

  // Weighted-average number of years until principal is repaid -- longer is safer.
  scope.AverageTimeToMaturity = (amounts, years) => scope.weightedAverage(years, amounts);

  // Weighted-average number of years until each debt's interest rate resets --
  // relevant for floating-rate exposure.
  scope.AverageTimeToRefixing = (amounts, yearsToRefix) => scope.weightedAverage(yearsToRefix, amounts);

  // Weighted-average interest rate across the whole portfolio.
  scope.WeightedAverageInterestRate = (amounts, rates) => scope.weightedAverage(rates, amounts);

  // Present value of debt: each future payment discounted back to today.
  // faceValues, rates (%), and years must be the same length (one entry per debt instrument).
  scope.PVofDebt = (faceValues, rates, years) =>
    faceValues.reduce((acc, fv, i) => acc + fv / Math.pow(1 + (rates[i] || 0) / 100, years[i] || 0), 0);

  // What share of total debt is exposed to foreign-currency movement.
  scope.ExchangeRateExposure = (foreignDebt, totalDebt) => (total(totalDebt) === 0 ? 0 : (total(foreignDebt) / total(totalDebt)) * 100);

  // What share of total debt matures within a given horizon (default 1 year) --
  // the amount that has to be refinanced soon, and is exposed to whatever
  // rates/conditions look like when that happens.
  scope.RefinancingRisk = (amounts, yearsToMaturity, thresholdYears = 1) => {
    const totalAmt = total(amounts);
    if (!totalAmt) return 0;
    const dueSoon = amounts.reduce((acc, a, i) => acc + (yearsToMaturity[i] <= thresholdYears ? a : 0), 0);
    return (dueSoon / totalAmt) * 100;
  };

  scope.ExternalDebtRatio = (external, totalDebt) => (total(totalDebt) === 0 ? 0 : (total(external) / total(totalDebt)) * 100);
  scope.DomesticDebtRatio = (domestic, totalDebt) => (total(totalDebt) === 0 ? 0 : (total(domestic) / total(totalDebt)) * 100);
}

export function runFormula(expression, dataset, industry) {
  if (!expression || !expression.trim()) return { ok: true, value: null };
  try {
    const scope = buildScope(dataset, industry);
    const value = evaluate(expression, scope);

    // A formula can technically evaluate to something that isn't a
    // single number -- e.g. typing just a column name ("total_debt")
    // returns the whole column as an array, and mathjs also has its
    // own array/Matrix types for things like "col_a + col_b" done
    // element-wise without reducing. Catch that here with a clear
    // message, rather than returning ok:true with a value that would
    // crash later when something tries to call .toFixed() on it.
    const numericValue = typeof value === "object" && value !== null && typeof value.valueOf === "function" ? value.valueOf() : value;
    if (typeof numericValue !== "number" || Number.isNaN(numericValue)) {
      return { ok: false, error: "This formula doesn't resolve to a single number yet. Wrap it in sum(), average(), or a named function, e.g. sum(total_debt)." };
    }

    return { ok: true, value: numericValue };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Formats a raw numeric formula result for KPI display, guessing at
// percentage vs currency vs plain number based on the expression text.
export function formatFormulaResult(expression, value) {
  if (value === null || value === undefined || typeof value !== "number" || Number.isNaN(value)) return "--";
  const looksLikePercent = /growth|percent|%|share|ratio|todebt|servicer|exposure|risk/i.test(expression);
  if (looksLikePercent) return `${value.toFixed(2)}%`;
  if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return value.toFixed(2);
}

// Business-meaningful title suggestions for the built-in named
// functions -- when a user's formula matches one of these, the
// Calculate panel can auto-suggest a proper title (e.g. "Debt-to-GDP
// Ratio" instead of the raw expression text) while still letting them
// rename it themselves.
const FUNCTION_TITLES = [
  [/DebtToGDP/, "Debt-to-GDP Ratio"],
  [/DebtServiceRatio/, "Debt Service Ratio"],
  [/AverageTimeToMaturity/, "Average Time to Maturity"],
  [/AverageTimeToRefixing/, "Average Time to Refixing"],
  [/WeightedAverageInterestRate/, "Weighted Average Interest Rate"],
  [/PVofDebt/, "Present Value of Debt"],
  [/ExchangeRateExposure/, "Exchange Rate Exposure"],
  [/RefinancingRisk/, "Refinancing Risk"],
  [/ExternalDebtRatio/, "External Debt Ratio"],
  [/DomesticDebtRatio/, "Domestic Debt Ratio"],
  [/growth/, "Growth Rate"],
  [/weightedAverage/, "Weighted Average"],
];

export function suggestFormulaTitle(expression) {
  const match = FUNCTION_TITLES.find(([pattern]) => pattern.test(expression));
  return match ? match[1] : null;
}
