import Navbar from "@/components/Navbar";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
              Welcome back
            </h1>
            <p className="font-body text-muted-foreground">
              Log in to your EpixBox account
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-heading text-xs uppercase tracking-wider text-foreground">
                  Password
                </label>
                <Link to="/forgot-password" className="font-body text-xs text-muted-foreground hover:text-foreground underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none transition-colors pr-12"
                  placeholder="••••••••"
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

            <button type="submit" className="btn-cta w-full justify-center">
              Log In <ArrowRight size={18} />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 border-t border-border" />
            <span className="font-body text-xs text-muted-foreground uppercase">or continue with</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-outline-cta py-3 px-4 text-xs justify-center">
              Google
            </button>
            <button className="btn-outline-cta py-3 px-4 text-xs justify-center">
              Apple
            </button>
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
