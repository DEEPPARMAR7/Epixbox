import { ArrowRight } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

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
      {/* Featured testimonial */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-8 mb-16">
        <div className="flex-shrink-0">
          <img
            src={testimonials[0].image}
            alt={testimonials[0].name}
            className="w-full h-[300px] lg:h-full object-cover"
            loading="lazy"
            width={512}
            height={512}
          />
        </div>
        <div className="flex flex-col justify-center">
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-body text-foreground leading-relaxed mb-6">
            "{testimonials[0].quote}"
          </blockquote>
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
              {testimonials[0].name}
            </h4>
            <a href="#" className="font-body text-muted-foreground underline text-sm">
              {testimonials[0].business}
            </a>
            <div className="flex gap-2 mt-3">
              {testimonials[0].tags.map((tag) => (
                <span key={tag} className="font-heading text-xs tracking-wider bg-secondary text-secondary-foreground px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Other testimonials */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {testimonials.slice(1).map((t) => (
          <div key={t.name} className="flex gap-4 items-start">
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 object-cover flex-shrink-0"
              loading="lazy"
              width={512}
              height={512}
            />
            <div>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
                {t.name}
              </h4>
              <a href="#" className="font-body text-muted-foreground underline text-sm">
                {t.business}
              </a>
              <div className="flex gap-2 mt-2">
                {t.tags.map((tag) => (
                  <span key={tag} className="font-heading text-xs tracking-wider bg-secondary text-secondary-foreground px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
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
