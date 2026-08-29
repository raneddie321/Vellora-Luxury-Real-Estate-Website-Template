"use client";

import * as React from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { InputBoxed } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/motion/counter";
import { calculateMortgage, estimatePurchaseCosts } from "@/lib/mortgage";
import { siteConfig } from "@/config/site";
import { formatPrice, formatPriceCompact } from "@/lib/utils";

const PRICE = { min: 200_000, max: 12_000_000, step: 25_000 };
const RATE = { min: 0.5, max: 9, step: 0.05 };
const TERM = { min: 5, max: 40, step: 1 };

function Row({
  id,
  label,
  hint,
  value,
  onChange,
  bounds,
  format,
  suffix,
  decimals = 0,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  bounds: { min: number; max: number; step: number };
  format: (value: number) => string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <label htmlFor={id} className="eyebrow text-content-faint">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <InputBoxed
            id={id}
            type="number"
            inputMode="decimal"
            value={Number.isFinite(value) ? value : ""}
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) {
                onChange(Math.min(bounds.max, Math.max(bounds.min, next)));
              }
            }}
            className="w-32 py-1.5 text-right text-sm tabular-nums"
          />
          {suffix ? <span className="text-sm text-content-faint">{suffix}</span> : null}
        </div>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        onValueChange={([next]) => onChange(next ?? bounds.min)}
        className="mt-5"
      />
      <div className="mt-3 flex justify-between text-xs text-content-faint tabular-nums">
        <span>{format(bounds.min)}</span>
        {hint ? <span className="text-content-muted">{hint}</span> : null}
        <span>
          {format(bounds.max)}
          {decimals ? "" : ""}
        </span>
      </div>
    </div>
  );
}

export function MortgageCalculator({ defaultPrice = 2_500_000 }: { defaultPrice?: number }) {
  const [price, setPrice] = React.useState(defaultPrice);
  const [depositPercent, setDepositPercent] = React.useState(30);
  const [rate, setRate] = React.useState(3.4);
  const [years, setYears] = React.useState(25);

  const downPayment = Math.round((price * depositPercent) / 100);
  const result = React.useMemo(
    () => calculateMortgage({ price, downPayment, interestRate: rate, years }),
    [price, downPayment, rate, years],
  );
  const costs = React.useMemo(() => estimatePurchaseCosts(price), [price]);

  const interestShare =
    result.totalCost > 0 ? (result.totalInterest / result.totalCost) * 100 : 0;

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-6">
        <div className="space-y-10 border border-hairline bg-surface-raised p-6 sm:p-8">
          <Row
            id="calc-price"
            label="Property price"
            value={price}
            onChange={setPrice}
            bounds={PRICE}
            format={formatPriceCompact}
          />
          <Row
            id="calc-deposit"
            label="Down payment"
            hint={formatPrice(downPayment)}
            value={depositPercent}
            onChange={setDepositPercent}
            bounds={{ min: 5, max: 90, step: 1 }}
            format={(v) => `${v}%`}
            suffix="%"
          />
          <Row
            id="calc-rate"
            label="Interest rate"
            value={rate}
            onChange={setRate}
            bounds={RATE}
            format={(v) => `${v}%`}
            suffix="%"
            decimals={2}
          />
          <Row
            id="calc-term"
            label="Loan term"
            value={years}
            onChange={setYears}
            bounds={TERM}
            format={(v) => `${v} yrs`}
            suffix="yrs"
          />
        </div>

        <div className="mt-8 border border-hairline p-6 sm:p-8">
          <h2 className="eyebrow text-content-faint">Indicative purchase costs</h2>
          <dl className="mt-5 divide-y divide-[color:var(--hairline)] border-y border-hairline">
            {costs.items.map((item) => (
              <div key={item.label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-content-muted">{item.label}</dt>
                <dd className="text-content tabular-nums">{formatPrice(item.value)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex justify-between gap-4">
            <p className="text-sm text-content">Total, in addition to the price</p>
            <p className="text-sm text-content tabular-nums">{formatPrice(costs.total)}</p>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-content-faint">
            Estimates for {siteConfig.market.country} at current rates. Your lawyer will give you an
            exact figure before you commit.
          </p>
        </div>
      </div>

      <div className="lg:col-span-6">
        <div className="lg:sticky lg:top-28">
          <div className="theme-dark border border-hairline bg-surface p-7 text-content sm:p-9">
            <p className="eyebrow text-[var(--accent)]">Monthly payment</p>
            <p className="mt-5 font-serif text-[3.25rem] leading-none tracking-[-0.04em] tabular-nums sm:text-[4rem]">
              <Counter
                value={Math.round(result.monthlyPayment)}
                prefix={siteConfig.market.currencySymbol}
                duration={0.7}
              />
            </p>
            <p className="mt-4 text-sm text-content-muted">
              over {years} years at {rate.toFixed(2)}% · {result.loanToValue.toFixed(0)}% LTV
            </p>

            <dl className="mt-9 divide-y divide-[color:var(--hairline)] border-y border-hairline">
              {[
                { label: "Loan amount", value: result.principal },
                { label: "Down payment", value: downPayment },
                { label: "Total interest", value: result.totalInterest },
                { label: "Total repaid", value: result.totalCost },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-3.5">
                  <dt className="text-sm text-content-muted">{row.label}</dt>
                  <dd className="text-sm text-content tabular-nums">
                    {formatPrice(Math.round(row.value))}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <p className="eyebrow text-content-faint">Principal vs interest</p>
              <div
                className="mt-4 flex h-2 w-full overflow-hidden"
                role="img"
                aria-label={`Interest is ${interestShare.toFixed(0)} percent of total repayments`}
              >
                <span
                  className="bg-[var(--color-gold-300)] transition-[width] duration-500 ease-[var(--ease-editorial)]"
                  style={{ width: `${100 - interestShare}%` }}
                />
                <span
                  className="bg-content-faint/50 transition-[width] duration-500 ease-[var(--ease-editorial)]"
                  style={{ width: `${interestShare}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs text-content-muted tabular-nums">
                <span>Principal {(100 - interestShare).toFixed(0)}%</span>
                <span>Interest {interestShare.toFixed(0)}%</span>
              </div>
            </div>

            <Button asChild variant="inverse" size="lg" className="mt-9 w-full">
              <Link href="/contact?service=investment">Speak to an advisor</Link>
            </Button>
          </div>

          <div className="mt-8 border border-hairline p-6 sm:p-7">
            <h2 className="eyebrow text-content-faint">Balance over time</h2>
            <ol className="mt-5 space-y-2">
              {result.schedule
                .filter((_, i, all) => i % Math.max(1, Math.ceil(all.length / 8)) === 0)
                .map((entry) => {
                  const share = result.principal > 0 ? entry.balance / result.principal : 0;
                  return (
                    <li key={entry.year} className="flex items-center gap-4 text-xs">
                      <span className="w-12 shrink-0 text-content-faint tabular-nums">
                        Yr {entry.year}
                      </span>
                      <span className="h-1.5 flex-1 bg-content/[0.07]">
                        <span
                          className="block h-full bg-content/45 transition-[width] duration-500"
                          style={{ width: `${Math.max(0, share * 100)}%` }}
                        />
                      </span>
                      <span className="w-24 shrink-0 text-right text-content-muted tabular-nums">
                        {formatPriceCompact(Math.round(entry.balance))}
                      </span>
                    </li>
                  );
                })}
            </ol>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-content-faint">
            This calculator is a guide, not an offer. Figures exclude buildings insurance, life
            cover and any lender arrangement fee. Vellora does not provide financial advice and
            receives no commission from lenders.
          </p>
        </div>
      </div>
    </div>
  );
}
