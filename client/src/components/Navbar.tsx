import { useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import BrandLogo from "./BrandLogo";
import { useAuth } from "../hooks/use-auth";

const navLinks = [
  { label: "features", href: "/features" },
  { label: "pricing", href: "/pricing" },
  { label: "apps", href: "/apps" },
  { label: "resources", href: "/resources" },
  { label: "about", href: "/about" },
  { label: "log in", href: "/login" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const links = isAuthenticated
    ? navLinks.filter((l) => l.href !== "/login")
    : navLinks;

  const onLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-border/70 bg-background/80 px-5 md:px-7 h-16 md:h-18 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <Link to="/" aria-label="EpixBox home" className="text-foreground">
          <BrandLogo textClassName="text-lg md:text-xl" />
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`font-heading text-[11px] uppercase tracking-[0.24em] transition-colors ${
                location.pathname === link.href
                  ? "text-accent-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full border border-border/70 p-2.5 transition-colors hover:bg-muted"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-foreground" />
            ) : (
              <Moon size={20} className="text-foreground" />
            )}
          </button>

          {isAuthenticated ? (
            <button onClick={onLogout} className="btn-outline-cta text-xs py-3 px-6">
              logout
            </button>
          ) : (
            <>
              <Link to="/support" className="font-heading text-[11px] uppercase tracking-[0.24em] text-foreground/70 hover:text-foreground mr-4">
                Support
              </Link>
              <Link to="/signup" className="btn-cta text-xs py-3 px-6">
                try free
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-full border border-border/70 p-2.5 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-[28px] border border-border/70 bg-background/95 px-6 py-6 space-y-4 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="block font-heading text-sm tracking-[0.2em] text-foreground uppercase"
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
