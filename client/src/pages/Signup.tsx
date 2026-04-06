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
        <div className="hidden lg:flex lg:w-1/2 bg-foreground text-primary-foreground p-16 flex-col justify-center">
          <h2 className="font-heading font-bold text-4xl mb-6 text-primary-foreground">
            Start your photography journey today.
          </h2>
          <p className="font-body text-lg text-primary-foreground/70 mb-10">
            Join thousands of photographers who trust EpixBox to showcase and sell their work.
          </p>
          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-accent flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-accent-foreground" />
                </div>
                <span className="font-body text-sm text-primary-foreground/90">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right - Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
                Create your account
              </h1>
              <p className="font-body text-muted-foreground">
                Start your 14-day free trial
              </p>
            </div>

            {/* Plan selector */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              {["basic", "power", "pro"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`font-heading text-xs uppercase tracking-wider py-3 border-2 transition-colors ${
                    plan === p
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none transition-colors"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none transition-colors pr-12"
                    placeholder="8+ characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-cta w-full justify-center" disabled={submitting}>
                {submitting ? "Creating..." : "Start Free Trial"} <ArrowRight size={18} />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 border-t border-border" />
              <span className="font-body text-xs text-muted-foreground uppercase">or sign up with</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="space-y-3">
              {googleClientId ? (
                <div className="w-full flex justify-center">
                  <div ref={googleButtonRef} className="w-full max-w-xs" />
                </div>
              ) : (
                <p className="text-center font-body text-xs text-muted-foreground">
                  Google signup is not configured yet. Add VITE_GOOGLE_CLIENT_ID in your env.
                </p>
              )}
              {!googleReady && googleClientId && (
                <p className="text-center font-body text-xs text-muted-foreground">Loading Google Sign-In...</p>
              )}
            </div>

            <p className="text-center font-body text-xs text-muted-foreground mt-8">
              By signing up, you agree to our{" "}
              <a href="#" className="underline">Terms</a> and{" "}
              <a href="#" className="underline">Privacy Policy</a>.
            </p>

            <p className="text-center font-body text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground font-medium underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
