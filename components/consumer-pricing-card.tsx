"use client";

import { useState } from "react";
import Link from "next/link";

const paymentMethods = [
  { id: "card", label: "Card / Apple Pay / Google Pay" },
  { id: "ideal", label: "iDEAL" }
] as const;

const planOptions = [
  {
    id: "monthly",
    label: "Plus Monthly",
    price: "$12.99",
    cadence: "per month",
    note: "Best for active room projects when you want more tries in a short period.",
    features: ["60 concepts / month", "Priority generation", "Unlimited 1v1 compare"]
  },
  {
    id: "yearly",
    label: "Plus Yearly",
    price: "$99",
    cadence: "per year",
    note: "Lower yearly pricing for people redesigning multiple rooms over time.",
    features: ["Everything in Plus", "Save 36%", "Best value for multi-room projects"]
  }
] as const;

type PaymentMethodId = (typeof paymentMethods)[number]["id"];
type PlanId = (typeof planOptions)[number]["id"];

export function ConsumerPricingCard({ plannerHref }: { plannerHref: string }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("card");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("monthly");

  const activePayment = paymentMethods.find((method) => method.id === paymentMethod) ?? paymentMethods[0];
  const activePlan = planOptions.find((plan) => plan.id === selectedPlan) ?? planOptions[0];

  return (
    <section className="panel consumer-billing-panel" style={{ marginTop: 18 }}>
      <div className="consumer-billing-card">
        <div className="consumer-billing-header">
          <span className="consumer-billing-icon" aria-hidden="true" />
          <div className="stack">
            <span className="home-kicker">Pricing</span>
            <h2 className="section-title">Billing</h2>
          </div>
        </div>

        <p className="lead consumer-billing-lead">
          Go Plus for more room concepts, quicker generations, and a bigger library of looks to compare.
        </p>

        <p className="consumer-billing-current">
          Current plan: <strong>Free</strong>
        </p>

        <div className="consumer-billing-block">
          <span className="consumer-billing-label">Pay with</span>
          <div className="consumer-billing-toggle-row" role="group" aria-label="Payment methods">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                className={`consumer-billing-toggle ${paymentMethod === method.id ? "active" : ""}`}
                aria-pressed={paymentMethod === method.id}
                onClick={() => setPaymentMethod(method.id)}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div className="consumer-billing-block">
          <span className="consumer-billing-label">Upgrade options</span>
          <div className="consumer-billing-plan-row" role="group" aria-label="Plans">
            {planOptions.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`consumer-billing-plan ${selectedPlan === plan.id ? "active" : ""}`}
                aria-pressed={selectedPlan === plan.id}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.label} ({plan.price})
              </button>
            ))}
          </div>
        </div>

        <div className="consumer-billing-summary">
          <div className="consumer-billing-summary-price">
            <span className="consumer-billing-summary-label">{activePlan.label}</span>
            <strong>{activePlan.price}</strong>
            <span className="small-note">{activePlan.cadence}</span>
          </div>
          <div className="consumer-billing-summary-copy">
            <span className="small-note">{activePlan.note}</span>
            <span className="small-note">Selected payment method: {activePayment.label}</span>
          </div>
          <div className="consumer-billing-feature-row">
            {activePlan.features.map((feature) => (
              <span key={feature} className="check-chip active">
                {feature}
              </span>
            ))}
            <span className="check-chip">Free stays at 1 generation / day</span>
          </div>
        </div>

        <div className="cta-row">
          <Link className="cta cta-primary" href={plannerHref}>
            Try 1 free concept
          </Link>
        </div>
      </div>
    </section>
  );
}
