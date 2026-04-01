import BrandLogo from "@/components/BrandLogo";
import { Link } from "react-router-dom";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Templates", href: "/#templates" },
    { label: "Portfolio Sites", href: "/signup" },
    { label: "Client Galleries", href: "/dashboard/galleries" },
  ],
  Resources: [
    { label: "Blog", href: "/resources" },
    { label: "Help Center", href: "/resources" },
    { label: "Community", href: "/resources" },
    { label: "Webinars", href: "/resources" },
    { label: "API", href: "/resources" },
  ],
  Company: [
    { label: "About", href: "/signup" },
    { label: "Careers", href: "/resources" },
    { label: "Press", href: "/resources" },
    { label: "Contact", href: "/resources" },
    { label: "Partners", href: "/resources" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/signup" },
    { label: "Terms of Service", href: "/signup" },
    { label: "Cookie Policy", href: "/signup" },
    { label: "DMCA", href: "/signup" },
  ],
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
                <li key={link.label}>
                  <Link to={link.href} className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
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
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            Twitter
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            Instagram
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
