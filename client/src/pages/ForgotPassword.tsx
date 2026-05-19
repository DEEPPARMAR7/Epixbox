import Navbar from "../components/Navbar";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { forgotPassword } = useAuth();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success("Reset link sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

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
            <form className="space-y-5" onSubmit={onSubmit}>
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
              <button type="submit" className="btn-cta w-full justify-center" disabled={submitting}>
                {submitting ? "Sending..." : "Send Reset Link"} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl text-foreground mb-2">Check your email</h2>
                <p className="font-body text-sm text-muted-foreground">
                  We've sent a password reset link to the email address associated with your account.
                  The link will expire in 1 hour.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="font-body text-xs text-blue-900 dark:text-blue-200">
                  <strong>Didn't receive the email?</strong> Check your spam or junk folder. If you still don't see it, try requesting a new reset link below.
                </p>
              </div>
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
