import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    price: "13",
    period: "/mo",
    description: "For hobbyists who want a clean portfolio and unlimited photo storage.",
    features: [
      "Unlimited photo uploads",
      "Custom photo site",
      "Basic customization",
      "Privacy controls",
      "24/7 support",
    ],
    cta: "Start Trial",
    featured: false,
  },
  {
    name: "Power",
    price: "27",
    period: "/mo",
    description: "For creators who want to showcase, proof, and share with clients.",
    features: [
      "Everything in Basic",
      "Advanced customization",
      "Client proofing",
      "Photo downloads",
      "Marketing tools",
      "Portfolio website",
    ],
    cta: "Start Trial",
    featured: false,
  },
  {
    name: "Pro",
    price: "36",
    period: "/mo",
    description: "For professionals who want to sell, grow, and run the business.",
    features: [
      "Everything in Power",
      "Print sales & fulfillment",
      "Digital download sales",
      "Custom price lists",
      "Coupons & discounts",
      "Business analytics",
      "Priority support",
    ],
    cta: "Start Trial",
    featured: true,
  },
];

const PricingSection = () => {
  return (
    <section className="section-padding bg-card" id="pricing">
      <div className="text-center mb-16">
        <p className="font-heading text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          SmugMug-style memberships
        </p>
        <h2 className="heading-lg text-foreground mb-4">
          Professional plans for every stage.
        </h2>
        <p className="body-lg max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required. Upgrade, downgrade, or cancel anytime.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider text-foreground">
          Annual billing saves up to 30%
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 border-2 transition-all ${
              plan.featured
                ? "border-foreground bg-foreground text-primary-foreground shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
                : "border-border bg-background text-card-foreground"
            }`}
          >
            {plan.featured && (
              <span className="inline-block mb-4 border border-accent/60 bg-accent px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
                Most Popular
              </span>
            )}
            <h3 className="font-heading font-bold text-lg uppercase tracking-wider mb-2">
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-heading font-bold">${plan.price}</span>
              <span className={`text-sm font-body ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.period}
              </span>
            </div>
            <p className={`text-sm font-body mb-6 ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {plan.description}
            </p>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm font-body">
                  <Check size={16} className={`mt-0.5 flex-shrink-0 ${plan.featured ? "text-accent" : "text-foreground"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className={`w-full justify-center ${plan.featured ? "btn-cta" : "btn-outline-cta"}`}
            >
              {plan.cta} <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto mt-8 flex flex-col items-center justify-between gap-4 border-2 border-border bg-background px-6 py-5 text-center md:flex-row md:text-left">
        <p className="font-body text-sm text-muted-foreground">
          Need full feature breakdown and business tools comparison before choosing?
        </p>
        <Link to="/pricing" className="btn-outline-cta text-xs py-3 px-6">
          Compare All Plans <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default PricingSection;
