import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link } from "../components/ui/link";
import { authService } from "../services";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const isResetMode = token.length > 0;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestResult, setRequestResult] = useState<{ message: string; resetUrl?: string } | null>(null);

  const helperText = useMemo(() => {
    if (isResetMode) {
      return "Enter a new password for your account. The reset link is valid for 30 minutes.";
    }
    return "Enter your account email address and we will generate a password reset link.";
  }, [isResetMode]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const result = await authService.forgotPassword(email);
      setRequestResult(result);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to request password reset");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const result = await authService.resetPassword(token, password);
      toast.success(result.message);
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="outline" asChild>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                {isResetMode ? <KeyRound className="h-6 w-6 text-blue-600" /> : <Mail className="h-6 w-6 text-blue-600" />}
                {isResetMode ? "Set a New Password" : "Forgot Your Password?"}
              </CardTitle>
              <CardDescription>{helperText}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isResetMode ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Generate Reset Link
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    Update Password
                  </Button>
                </form>
              )}

              {requestResult ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Reset link generated</p>
                      <p>{requestResult.message}</p>
                      {requestResult.resetUrl ? (
                        <div className="rounded-lg bg-white p-3 text-xs break-all border border-green-200">
                          <p className="font-medium mb-1">Development reset link</p>
                          <a href={requestResult.resetUrl} className="text-blue-600 hover:underline">
                            {requestResult.resetUrl}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border bg-blue-50 p-4 text-blue-900 text-sm leading-6">
                <p className="font-medium mb-1">Deployment note</p>
                <p>
                  In development, the backend can also return the generated reset link directly when SMTP is not configured. In production, configure SMTP credentials so the link is emailed to the user securely.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
