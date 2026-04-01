import BrandLogo from "@/components/BrandLogo";

const footerLinks = {
  Product: ["Features", "Pricing", "Templates", "Portfolio Sites", "Client Galleries"],
  Resources: ["Blog", "Help Center", "Community", "Webinars", "API"],
  Company: ["About", "Careers", "Press", "Contact", "Partners"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DMCA"],
};

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground section-padding">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4">
            <BrandLogo theme="dark" textClassName="text-2xl" />
          </div>
          <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
            The all-in-one platform for photographers to store, share, and sell.
          </p>
        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider mb-4">
              {title}
            </h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} EpixBox. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            Twitter
          </a>
          <a href="#" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            Instagram
          </a>
          <a href="#" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
