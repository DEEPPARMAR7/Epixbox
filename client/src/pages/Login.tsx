import Navbar from "../components/Navbar";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void;
        };
      };
    };
  }
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) as
      | string
      | undefined;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const initGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            toast.error("Google login failed");
            return;
          }

          try {
            setSubmitting(true);
            await loginWithGoogle(response.credential);
            toast.success("Welcome back");
            navigate("/dashboard");
          } catch (err) {
            const message = err instanceof Error ? err.message : "Google login failed";
            toast.error(message);
          } finally {
            setSubmitting(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      const containerWidth = googleButtonRef.current?.offsetWidth || 320;
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: Math.min(containerWidth, 360),
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initGoogleButton();
      return;
    }

    const existingScript = document.getElementById("google-identity-script") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", initGoogleButton);
      return () => existingScript.removeEventListener("load", initGoogleButton);
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogleButton;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleClientId, loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-16 md:py-24 page-transition">
        <div className="w-full max-w-md animate-scale-in">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-3">
              Welcome back
            </h1>
            <p className="font-body text-lg text-muted-foreground">
              Log in to your EpixBox account
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground block mb-2.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border-2 border-border px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200 rounded-lg smooth-transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                  Password
                </label>
                <Link to="/forgot-password" className="font-body text-sm text-muted-foreground hover:text-accent underline underline-offset-2 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card border-2 border-border px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200 rounded-lg smooth-transition pr-13"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors smooth-transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-cta w-full justify-center py-4 text-base font-semibold btn-transition" disabled={submitting}>
              {submitting ? "Logging in..." : "Log In"} <ArrowRight size={20} />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 border-t border-border" />
            <span className="font-body text-xs text-muted-foreground uppercase font-semibold">or continue with</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Social */}
          <div className="space-y-4">
            {googleClientId ? (
              <div className="w-full flex justify-center animate-fade-in">
                <div ref={googleButtonRef} className="w-full max-w-xs" />
              </div>
            ) : (
              <p className="text-center font-body text-sm text-muted-foreground">
                Google login is not configured yet. Add VITE_GOOGLE_CLIENT_ID in your env.
              </p>
            )}
            {!googleReady && googleClientId && (
              <p className="text-center font-body text-xs text-muted-foreground">Loading Google Sign-In...</p>
            )}
          </div>

          <p className="text-center font-body text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-foreground font-medium underline">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
