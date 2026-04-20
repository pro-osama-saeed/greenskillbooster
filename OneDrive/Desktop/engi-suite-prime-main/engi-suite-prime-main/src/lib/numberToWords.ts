// Pakistani / South-Asian numbering: lakh (100,000) and crore (10,000,000)
// Outputs e.g. "Rupees one lakh twenty-three thousand four hundred and fifty only"
// or with paisa: "... and fifty paisa only"

const ones = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

const twoDigits = (n: number): string => {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? "-" + ones[o] : "");
};

const threeDigits = (n: number): string => {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(ones[h] + " hundred");
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" and ");
};

/** Convert non-negative integer (up to 99,99,99,999) into Indian/Pakistani words. */
export const integerToIndianWords = (num: number): string => {
  if (!Number.isFinite(num)) return "";
  num = Math.floor(Math.abs(num));
  if (num === 0) return "zero";

  const crore = Math.floor(num / 10000000);
  const afterCrore = num % 10000000;
  const lakh = Math.floor(afterCrore / 100000);
  const afterLakh = afterCrore % 100000;
  const thousand = Math.floor(afterLakh / 1000);
  const remainder = afterLakh % 1000;

  const parts: string[] = [];
  if (crore) parts.push(twoDigits(crore) + " crore");
  if (lakh) parts.push(twoDigits(lakh) + " lakh");
  if (thousand) parts.push(twoDigits(thousand) + " thousand");
  if (remainder) parts.push(threeDigits(remainder));
  return parts.join(" ");
};

/** Format an amount as Pakistani-style "Rupees ... only" with optional paisa. */
export const amountInWordsPKR = (amount: number): string => {
  const safe = Number(amount) || 0;
  const sign = safe < 0 ? "Minus " : "";
  const abs = Math.abs(safe);
  const rupees = Math.floor(abs);
  const paisa = Math.round((abs - rupees) * 100);

  const rupeesPart = `Rupees ${integerToIndianWords(rupees)}`;
  const paisaPart = paisa > 0 ? ` and ${integerToIndianWords(paisa)} paisa` : "";
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return cap(`${sign}${rupeesPart}${paisaPart} only`);
};
