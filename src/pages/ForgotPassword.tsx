import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { forgotPassword } from '@/services/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Success State */}
      {isSuccess ? (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Check your email
          </h2>
          <p className="text-muted-foreground text-lg">
            We've sent a password reset link to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="pt-6">
            <Link to="/login">
              <Button variant="outline" className="w-full h-12 text-base font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Form State */
        <>
          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "pl-12 h-12 text-base",
                    error && !email && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            {/* Back to Login */}
            <div className="flex justify-center mt-6">
              <Link
                to="/login"
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className="relative mt-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">
                Trusted by landlords across Kenya
              </span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-8 text-muted-foreground mt-8">
            {[
              { icon: '🔒', label: 'Secure' },
              { icon: '🏠', label: 'Local' },
              { icon: '💚', label: 'Trusted' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  {icon}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </AuthLayout>
  );
}