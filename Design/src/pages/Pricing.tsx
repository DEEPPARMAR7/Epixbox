import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    monthlyPrice: 13,
    yearlyPrice: 9,
    description: "For hobbyists who want unlimited photo storage and a personal site.",
    features: [
      "Unlimited photo uploads",
      "Full-resolution storage",
      "Custom photo website",
      "Basic site customization",
      "Privacy controls",
      "Mobile app access",
      "24/7 support",
    ],
    notIncluded: [
      "Client proofing",
      "Print sales",
      "Digital download sales",
      "Advanced customization",
      "Marketing tools",
      "Business analytics",
    ],
  },
  {
    name: "Power",
    monthlyPrice: 27,
    yearlyPrice: 19,
    description: "For enthusiasts who want to showcase, share, and delight clients.",
    features: [
      "Everything in Basic",
      "Advanced site customization",
      "Client proofing & favorites",
      "Photo downloads for clients",
      "Password-protected galleries",
      "Portfolio website",
      "Marketing tools",
      "Contact forms",
    ],
    notIncluded: [
      "Print sales",
      "Digital download sales",
      "Custom price lists",
      "Business analytics",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 36,
    yearlyPrice: 27,
    description: "For professionals who want to sell, grow, and run their business.",
    features: [
      "Everything in Power",
      "Print sales & fulfillment",
      "Digital download sales",
      "Custom price lists",
      "Coupons & discounts",
      "Client management (CRM)",
      "Business analytics",
      "SEO tools",
      "Priority support",
    ],
    notIncluded: [],
    featured: true,
  },
];

const faqs = [
  {
    q: "Can I try EpixBox before I buy?",
    a: "Absolutely! Every plan comes with a free 14-day trial. No credit card required. You'll have full access to all features in your chosen plan.",
  },
  {
    q: "Can I change my plan later?",
    a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate any differences.",
  },
  {
    q: "What happens to my photos if I cancel?",
    a: "Your photos remain safe for 90 days after cancellation. You can download them anytime during this period. We'll never delete your work without notice.",
  },
  {
    q: "Do you take a commission on print sales?",
    a: "Never. You keep 100% of the markup on every sale. We only charge the base cost of production and shipping.",
  },
  {
    q: "Is there a limit on storage?",
    a: "No! All plans include truly unlimited photo and video storage at full resolution. No compression, no limits.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes! All plans support custom domains. We provide free SSL certificates and handle all the technical setup for you.",
  },
];

const comparisonFeatures = [
  { name: "Photo storage", basic: "Unlimited", power: "Unlimited", pro: "Unlimited" },
  { name: "Video storage", basic: "10 GB", power: "50 GB", pro: "Unlimited" },
  { name: "Custom domain", basic: true, power: true, pro: true },
  { name: "SSL certificate", basic: true, power: true, pro: true },
  { name: "Site templates", basic: "5", power: "15", pro: "All" },
  { name: "Client proofing", basic: false, power: true, pro: true },
  { name: "Password galleries", basic: false, power: true, pro: true },
  { name: "Print sales", basic: false, power: false, pro: true },
  { name: "Digital sales", basic: false, power: false, pro: true },
  { name: "Custom price lists", basic: false, power: false, pro: true },
  { name: "Marketing tools", basic: false, power: true, pro: true },
  { name: "Analytics", basic: "Basic", power: "Standard", pro: "Advanced" },
  { name: "SEO tools", basic: false, power: "Basic", pro: "Advanced" },
  { name: "Client CRM", basic: false, power: false, pro: true },
  { name: "Support", basic: "Email", power: "Email + Chat", pro: "Priority" },
];

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding text-center">
        <h1 className="heading-xl text-foreground mb-4">Plans & Pricing</h1>
        <p className="body-lg max-w-2xl mx-auto mb-10">
          Start free for 14 days. No credit card required. Pick the plan that grows with you.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`font-heading text-sm tracking-wider ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full border-2 border-foreground transition-colors ${
              isYearly ? "bg-accent" : "bg-secondary"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-foreground rounded-full transition-transform ${
                isYearly ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`font-heading text-sm tracking-wider ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Yearly
            <span className="ml-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 font-bold">
              SAVE 30%
            </span>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 border-2 text-left transition-all ${
                plan.featured
                  ? "border-foreground bg-foreground text-primary-foreground"
                  : "border-border bg-card text-card-foreground"
              }`}
            >
              {plan.featured && (
                <span className="inline-block bg-accent text-accent-foreground font-heading font-bold text-xs uppercase tracking-wider px-3 py-1 mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="font-heading font-bold text-lg uppercase tracking-wider mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-heading font-bold">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className={`text-sm font-body ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  /mo
                </span>
              </div>
              {isYearly && (
                <p className={`text-xs font-body mb-4 ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  Billed annually (${plan.yearlyPrice * 12}/year)
                </p>
              )}
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
                Start Free Trial <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding bg-card">
        <div className="max-w-5xl mx-auto">
          <h2 className="heading-lg text-foreground mb-10 text-center">
            Compare all features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="text-left font-heading text-sm uppercase tracking-wider py-4 pr-4 text-foreground">Feature</th>
                  <th className="text-center font-heading text-sm uppercase tracking-wider py-4 px-4 text-foreground">Basic</th>
                  <th className="text-center font-heading text-sm uppercase tracking-wider py-4 px-4 text-foreground">Power</th>
                  <th className="text-center font-heading text-sm uppercase tracking-wider py-4 px-4 text-foreground bg-accent/20">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.name} className="border-b border-border">
                    <td className="font-body text-sm py-3 pr-4 text-foreground">{row.name}</td>
                    {(["basic", "power", "pro"] as const).map((plan) => (
                      <td key={plan} className={`text-center py-3 px-4 ${plan === "pro" ? "bg-accent/10" : ""}`}>
                        {typeof row[plan] === "boolean" ? (
                          row[plan] ? (
                            <Check size={18} className="mx-auto text-foreground" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="font-body text-sm text-foreground">{row[plan]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <h2 className="heading-lg text-foreground mb-10 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="font-heading font-bold text-sm text-foreground pr-4">{faq.q}</span>
                  <HelpCircle size={20} className={`flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180 text-accent-foreground" : "text-muted-foreground"}`} />
                </button>
                {openFaq === i && (
                  <p className="font-body text-sm text-muted-foreground pb-5 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding bg-foreground text-primary-foreground text-center">
        <h2 className="heading-lg text-primary-foreground mb-4">Ready to get started?</h2>
        <p className="font-body text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
          Join thousands of photographers who trust EpixBox to power their business.
        </p>
        <Link to="/signup" className="btn-cta">
          Start Your Free Trial <ArrowRight size={18} />
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
