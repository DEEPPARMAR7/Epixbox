import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { useAuth } from "../hooks/use-auth";

const navLinks = [
  { label: "features", href: "/features" },
  { label: "pricing", href: "/pricing" },
  { label: "resources", href: "/resources" },
  { label: "log in", href: "/login" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const links = isAuthenticated
    ? navLinks.filter((l) => l.href !== "/login")
    : navLinks;

  const onLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 h-16 md:h-20">
        <Link to="/" aria-label="EpixBox home" className="text-foreground">
          <BrandLogo textClassName="text-xl md:text-2xl" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`font-heading text-sm tracking-wide transition-colors ${
                location.pathname === link.href
                  ? "text-accent-foreground underline underline-offset-4"
                  : "text-foreground hover:text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={onLogout} className="btn-outline-cta text-xs py-3 px-6">
              logout
            </button>
          ) : (
            <Link to="/signup" className="btn-cta text-xs py-3 px-6">
              try free
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 space-y-4">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="block font-heading text-sm tracking-wide text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={onLogout} className="btn-outline-cta text-xs py-3 px-6 w-full justify-center">
              logout
            </button>
          ) : (
            <Link to="/signup" className="btn-cta text-xs py-3 px-6 w-full justify-center" onClick={() => setMobileOpen(false)}>
              try free
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
