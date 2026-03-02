// pages/ResetPassword.tsx
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { resetPassword } from '@/services/auth.service';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (passwords.new_password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Calls the service instead of api.post directly
      // token is guaranteed to exist here because we check below before rendering this form
      await resetPassword(token!, passwords.new_password, passwords.confirm_password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>

      {/* ===== State 1: Success ===== */}
      {isSuccess ? (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Password Updated!
          </h2>
          <p className="text-muted-foreground text-lg">
            Your password has been changed successfully. You can now log in with your new credentials.
          </p>
          <div className="pt-6">
            <Link to="/login">
              <Button className="w-full h-12 text-base font-semibold">
                Sign In Now
              </Button>
            </Link>
          </div>
        </div>

      ) : !token ? (

        /* ===== State 2: No token in URL — invalid link ===== */
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Invalid Link
          </h2>
          <p className="text-muted-foreground text-lg">
            This password reset link is invalid or missing the security token. Please request a new one.
          </p>
          <div className="pt-6">
            <Link to="/forgot-password">
              <Button variant="outline" className="w-full h-12 text-base font-semibold">
                Request New Link
              </Button>
            </Link>
          </div>
        </div>

      ) : (

        /* ===== State 3: Valid token — show the form ===== */
        <>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
              Create New Password
            </h1>
            <p className="text-muted-foreground text-lg">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-foreground font-medium">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwords.new_password}
                  onChange={handleChange}
                  className="pl-12 pr-12 h-12 text-base"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-foreground font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwords.confirm_password}
                  onChange={handleChange}
                  className="pl-12 pr-12 h-12 text-base"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </>
      )}

    </AuthLayout>
  );
}