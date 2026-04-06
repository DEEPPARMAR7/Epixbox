import Navbar from "../components/Navbar";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";
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

const benefits = [
  "14-day free trial, no credit card needed",
  "Unlimited full-resolution photo storage",
  "Beautiful, customizable portfolio site",
  "Cancel anytime, hassle-free",
];

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("pro");
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) as
      | string
      | undefined;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await signup({ name, email, password });
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
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
            toast.error("Google signup failed");
            return;
          }

          try {
            setSubmitting(true);
            await loginWithGoogle(response.credential);
            toast.success("Welcome to EpixBox");
            navigate("/dashboard");
          } catch (err) {
            const message = err instanceof Error ? err.message : "Google signup failed";
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
        text: "signup_with",
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
      <div className="flex items-stretch min-h-[calc(100vh-5rem)]">
        {/* Left - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-foreground to-foreground/95 text-primary-foreground p-16 flex-col justify-center animate-slide-in-left">
          <h2 className="font-heading font-bold text-5xl mb-8 text-primary-foreground leading-tight">
            Start your photography journey today.
          </h2>
          <p className="font-body text-xl text-primary-foreground/80 mb-12 leading-relaxed">
            Join thousands of photographers who trust EpixBox to showcase and sell their work.
          </p>
          <ul className="space-y-5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-4 group">
                <div className="w-7 h-7 bg-accent flex items-center justify-center flex-shrink-0 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Check size={16} className="text-accent-foreground" />
                </div>
                <span className="font-body text-base text-primary-foreground/95 font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right - Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-16 animate-slide-in-right">
          <div className="w-full max-w-md animate-scale-in">
            <div className="text-center mb-12">
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-3">
                Create your account
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Start your 14-day free trial
              </p>
            </div>

            {/* Plan selector */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {["basic", "power", "pro"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`font-heading text-sm font-bold uppercase tracking-wider py-3 rounded-lg border-2 transition-all duration-200 btn-transition ${
                    plan === p
                      ? "border-accent bg-accent text-accent-foreground shadow-lg shadow-accent/30"
                      : "border-border bg-card text-foreground hover:border-accent/50 hover:bg-card/50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <label className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground block mb-2.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card border-2 border-border px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200 rounded-lg smooth-transition"
                  placeholder="Jane Doe"
                  required
                />
              </div>

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
                <label className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground block mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-card border-2 border-border px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200 rounded-lg smooth-transition pr-13"
                    placeholder="8+ characters"
                    required
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
                {submitting ? "Creating..." : "Start Free Trial"} <ArrowRight size={20} />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-10">
              <div className="flex-1 border-t border-border" />
              <span className="font-body text-xs text-muted-foreground uppercase font-semibold">or sign up with</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="space-y-4">
              {googleClientId ? (
                <div className="w-full flex justify-center animate-fade-in">
                  <div ref={googleButtonRef} className="w-full max-w-xs" />
                </div>
              ) : (
                <p className="text-center font-body text-sm text-muted-foreground">
                  Google signup is not configured yet. Add VITE_GOOGLE_CLIENT_ID in your env.
                </p>
              )}
              {!googleReady && googleClientId && (
                <p className="text-center font-body text-sm text-muted-foreground animate-pulse">Loading Google Sign-In...</p>
              )}
            </div>

            <p className="text-center font-body text-sm text-muted-foreground mt-10">
              By signing up, you agree to our{" "}
              <a href="#" className="underline hover:text-foreground transition-colors">Terms</a> and{" "}
              <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
            </p>

            <p className="text-center font-body text-base text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline transition-colors">
                Log in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
