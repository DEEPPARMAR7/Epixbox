import { ArrowRight } from "lucide-react";
import testimonial1 from "../assets/testimonial-1.jpg";
import testimonial2 from "../assets/testimonial-2.jpg";
import testimonial3 from "../assets/testimonial-3.jpg";

const testimonials = [
  {
    quote: "The amount of time we save with the built-in sales tools is amazing. Literally, other than taking the photo, there's not a single aspect of our business that's not run through EpixBox.",
    name: "Sarah Mitchell",
    business: "Mitchell Photography",
    tags: ["WEDDINGS", "PORTRAITS"],
    image: testimonial1,
    featured: true,
  },
  {
    quote: "EpixBox made it incredibly easy to deliver galleries and sell prints. My clients love the experience.",
    name: "James Carter",
    business: "Carter Visuals",
    tags: ["SPORTS", "EVENTS"],
    image: testimonial2,
    featured: false,
  },
  {
    quote: "I switched from three different platforms to just EpixBox. Everything I need is in one place.",
    name: "Linda Torres",
    business: "Torres Fine Art",
    tags: ["LANDSCAPE", "FINE ART"],
    image: testimonial3,
    featured: false,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding">
      <div className="mb-6">
        <p className="font-heading text-[11px] uppercase tracking-[0.32em] text-muted-foreground mb-3 text-center">
          Testimonials
        </p>
        <h2 className="heading-lg text-foreground text-center max-w-3xl mx-auto">
          A refined experience should feel credible from the first glance.
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr] mb-16">
        <div className="flex-shrink-0 overflow-hidden rounded-[30px] premium-card p-3 md:p-4">
          <img
            src={testimonials[0].image}
            alt={testimonials[0].name}
            className="w-full h-[300px] lg:h-full object-cover rounded-[22px]"
            loading="lazy"
            width={512}
            height={512}
          />
        </div>
        <div className="flex flex-col justify-center">
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-body text-foreground leading-relaxed mb-6 max-w-3xl">
            "{testimonials[0].quote}"
          </blockquote>
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-[0.22em] text-foreground">
              {testimonials[0].name}
            </h4>
            <a href="#" className="font-body text-muted-foreground underline text-sm">
              {testimonials[0].business}
            </a>
            <div className="flex gap-2 mt-3">
              {testimonials[0].tags.map((tag) => (
                <span key={tag} className="font-heading text-xs tracking-[0.2em] bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-12">
        {testimonials.slice(1).map((t) => (
          <div key={t.name} className="premium-card flex gap-4 items-start p-5 md:p-6">
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 object-cover flex-shrink-0 rounded-2xl"
              loading="lazy"
              width={512}
              height={512}
            />
            <div>
              <h4 className="font-heading font-bold text-sm uppercase tracking-[0.22em] text-foreground">
                {t.name}
              </h4>
              <a href="#" className="font-body text-muted-foreground underline text-sm">
                {t.business}
              </a>
              <div className="flex gap-2 mt-2">
                {t.tags.map((tag) => (
                  <span key={tag} className="font-heading text-xs tracking-[0.2em] bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <h3 className="heading-md text-foreground mb-6">
          Don't just take their words for it. Find a plan that fits <span className="italic">your vision</span>.
        </h3>
        <a href="#pricing" className="btn-outline-cta">
          Explore Plans <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
};

export default TestimonialsSection;
