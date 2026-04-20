export type TaxMode = "exclusive" | "inclusive";

export interface LineInput {
  quantity: number;
  rate: number;
  taxRate: number; // percentage e.g. 17
}

export interface LineCalc {
  net: number;       // pre-tax
  tax: number;       // tax amount
  gross: number;     // net + tax
}

/**
 * Calculate a single line.
 * - exclusive: rate is pre-tax → tax is added on top
 * - inclusive: rate already includes tax → split out the tax portion
 */
export const calcLine = (
  { quantity, rate, taxRate }: LineInput,
  mode: TaxMode = "exclusive"
): LineCalc => {
  const q = Number(quantity) || 0;
  const r = Number(rate) || 0;
  const t = Number(taxRate) || 0;
  const subtotal = q * r;

  if (mode === "inclusive") {
    const net = subtotal / (1 + t / 100);
    const tax = subtotal - net;
    return { net: round2(net), tax: round2(tax), gross: round2(subtotal) };
  }

  const tax = subtotal * (t / 100);
  return { net: round2(subtotal), tax: round2(tax), gross: round2(subtotal + tax) };
};

export const calcTotals = (lines: LineInput[], mode: TaxMode = "exclusive") => {
  return lines.reduce(
    (acc, l) => {
      const c = calcLine(l, mode);
      acc.subtotal += c.net;
      acc.tax_total += c.tax;
      acc.grand_total += c.gross;
      return acc;
    },
    { subtotal: 0, tax_total: 0, grand_total: 0 }
  );
};

export const formatPKR = (n: number) =>
  `₨ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const round2 = (n: number) => Math.round(n * 100) / 100;
