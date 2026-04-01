import Navbar from "@/components/Navbar";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { register as apiRegister } from "../api/authApi";
import useAuthStore from "../store/authStore";
import axios from "axios";

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [plan, setPlan] = useState("pro");
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s: any) => s.login);
  const navigate = useNavigate();

  const makeUsername = (value: string, mail: string) => {
    const base = (value || mail.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 18);
    return `${base || "user"}${Math.floor(Math.random() * 900 + 100)}`;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const emailValue = email.trim();

      if (!name.trim()) {
        throw new Error("Full name is required");
      }
      if (!emailValue) {
        throw new Error("Email is required");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const parts = name.trim().split(/\s+/).filter(Boolean);
      const first_name = parts[0] || "User";
      const last_name = parts.slice(1).join(" ");
      const username = makeUsername(name, emailValue);

      const res = await apiRegister({ email: emailValue, password, username, first_name, last_name });
      login(res.user, res.accessToken, res.refreshToken);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
          ? err.message
          : "Signup failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

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
                  type="button"
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
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="btn-outline-cta py-3 px-4 text-xs justify-center">
                Google
              </button>
              <button type="button" className="btn-outline-cta py-3 px-4 text-xs justify-center">
                Apple
              </button>
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
