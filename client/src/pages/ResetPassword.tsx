import Navbar from "../components/Navbar";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || params.get("t") || "", [params]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset token is missing or invalid");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success("Password updated successfully");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not reset password";
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
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">Set a new password</h1>
            <p className="font-body text-muted-foreground">
              {done ? "Your password has been updated." : "Enter your new password to finish resetting your account."}
            </p>
          </div>

          {!done ? (
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">New Password</label>
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
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none transition-colors"
                  placeholder="Retype password"
                  required
                />
              </div>

              <button type="submit" className="btn-cta w-full justify-center" disabled={submitting}>
                {submitting ? "Updating..." : "Update Password"} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="font-body text-sm text-muted-foreground">Redirecting you to login...</p>
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

export default ResetPasswordPage;
