/** Standard amortising-loan maths, kept out of the component that renders it. */

export type MortgageInput = {
  price: number;
  downPayment: number;
  /** Annual nominal rate as a percentage, e.g. 3.4 */
  interestRate: number;
  /** Term in years. */
  years: number;
};

export type MortgageResult = {
  principal: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanToValue: number;
  /** Year-by-year balance, for the amortisation chart. */
  schedule: { year: number; balance: number; interestPaid: number; principalPaid: number }[];
};

export function calculateMortgage({
  price,
  downPayment,
  interestRate,
  years,
}: MortgageInput): MortgageResult {
  const principal = Math.max(0, price - downPayment);
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = interestRate / 100 / 12;

  const monthlyPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

  const schedule: MortgageResult["schedule"] = [];
  let balance = principal;
  let interestPaid = 0;
  let principalPaid = 0;

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    const principalPart = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPart);
    interestPaid += interest;
    principalPaid += principalPart;
    if (month % 12 === 0 || month === months) {
      schedule.push({
        year: Math.ceil(month / 12),
        balance,
        interestPaid,
        principalPaid,
      });
    }
  }

  const totalPaid = monthlyPayment * months;
  return {
    principal,
    monthlyPayment: Number.isFinite(monthlyPayment) ? monthlyPayment : 0,
    totalInterest: Math.max(0, totalPaid - principal),
    totalCost: totalPaid,
    loanToValue: price > 0 ? (principal / price) * 100 : 0,
    schedule,
  };
}

/** Purchase costs on top of the price — indicative, and labelled as such in the UI. */
export function estimatePurchaseCosts(price: number) {
  const transferTax = price * 0.062;
  const stampDuty = price * 0.008;
  const notary = 1_200;
  const registration = 650;
  const legal = Math.max(2_500, price * 0.011);
  const total = transferTax + stampDuty + notary + registration + legal;
  return {
    items: [
      { label: "Transfer tax", value: transferTax },
      { label: "Stamp duty", value: stampDuty },
      { label: "Notary", value: notary },
      { label: "Land registry", value: registration },
      { label: "Legal fees", value: legal },
    ],
    total,
  };
}
