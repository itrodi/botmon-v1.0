// Currency localization helpers. The merchant dashboard is Naira-only for now.
// Use these instead of hand-rolling `$${x.toFixed(2)}` so currency is consistent
// across the app and easy to change later.

export const NAIRA = '₦';

const withDecimals = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeOnly = new Intl.NumberFormat('en-NG', {
  maximumFractionDigits: 0,
});

const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value == null || value === '') return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

// "₦1,234.56" — use for prices, totals, line items.
export const formatNaira = (value) => `${NAIRA}${withDecimals.format(toNumber(value))}`;

// "₦1,234" — use for headline figures where cents are noise.
export const formatNairaWhole = (value) => `${NAIRA}${wholeOnly.format(toNumber(value))}`;
