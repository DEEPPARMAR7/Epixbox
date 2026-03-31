import Navbar from "@/components/Navbar";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
              Reset password
            </h1>
            <p className="font-body text-muted-foreground">
              {submitted
                ? "Check your email for a reset link."
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {!submitted ? (
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
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
              <button type="submit" className="btn-cta w-full justify-center">
                Send Reset Link <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-accent flex items-center justify-center mx-auto mb-6">
                <ArrowRight size={24} className="text-accent-foreground" />
              </div>
              <p className="font-body text-sm text-muted-foreground mb-6">
                We sent a password reset link to <strong className="text-foreground">{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
            </div>
          )}

          <p className="text-center font-body text-sm text-muted-foreground mt-8">
            <Link to="/login" className="text-foreground font-medium underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
