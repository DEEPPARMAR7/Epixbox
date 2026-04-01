import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "13",
    period: "/mo",
    description: "For hobbyists who want unlimited photo storage.",
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
    description: "For enthusiasts who want to showcase and share.",
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
    description: "For professionals who want to sell and grow.",
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
    <section className="section-padding" id="pricing">
      <div className="text-center mb-16">
        <h2 className="heading-lg text-foreground mb-4">
          Simple, transparent pricing.
        </h2>
        <p className="body-lg max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 border-2 transition-all ${
              plan.featured
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-border bg-card text-card-foreground"
            }`}
          >
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
            <a
              href="#signup"
              className={`w-full justify-center ${plan.featured ? "btn-cta" : "btn-outline-cta"}`}
            >
              {plan.cta} <ArrowRight size={16} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
