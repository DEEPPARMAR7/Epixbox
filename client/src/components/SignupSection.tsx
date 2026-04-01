import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const SignupSection = () => {
  return (
    <section className="section-padding bg-card" id="signup">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="heading-lg text-foreground mb-4">
          Ready to build your photography business?
        </h2>
        <p className="body-lg max-w-2xl mx-auto mb-8">
          Start your free trial and get your portfolio, client galleries, and sales tools in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup" className="btn-cta">
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <a href="/#contact" className="btn-outline-cta">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;