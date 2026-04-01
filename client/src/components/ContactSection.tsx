import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ContactSection = () => {
  return (
    <section className="section-padding" id="contact">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          <div className="bg-foreground text-primary-foreground p-8 md:p-12">
            <p className="font-heading text-xs uppercase tracking-wider text-primary-foreground/60 mb-4">
              Contact
            </p>
            <h2 className="heading-lg text-primary-foreground mb-4">
              Talk to a real person.
            </h2>
            <p className="font-body text-lg text-primary-foreground/75 mb-8 leading-relaxed">
              Need help choosing a plan, connecting cloud storage, or restoring a feature? Reach out and we’ll point you to the right path.
            </p>
            <div className="space-y-4">
              <a href="mailto:support@epixbox.com" className="flex items-center gap-3 text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                <Mail size={18} />
                <span className="font-body">support@epixbox.com</span>
              </a>
              <a href="tel:+10000000000" className="flex items-center gap-3 text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                <MessageCircle size={18} />
                <span className="font-body">+1 (000) 000-0000</span>
              </a>
            </div>
          </div>

          <div className="bg-card border-2 border-border p-8 md:p-12 flex flex-col justify-between">
            <div>
              <h3 className="heading-md text-foreground mb-4">
                Get started now.
              </h3>
              <p className="body-lg mb-8">
                Open your account, upload photos, and publish your website in minutes.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Link to="/signup" className="btn-cta justify-center">
                Start Free Trial <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-outline-cta justify-center">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;