import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { Home, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import loginHero from '@/assets/login-hero.jpg'; 
import { api } from '@/services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    const payload = {
        "email": email
    }
    try {
     const response = await api.post("/users/forgot-password", payload);
     setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Hero Image (Kept identical for seamless routing transition) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={loginHero}
          alt="Modern home interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-black/70" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold">Home Zen</span>
          </div>
          
          <div className="max-w-md">
            <blockquote className="text-2xl font-heading font-medium leading-relaxed mb-6">
              "Home Zen transformed how I manage my properties. Everything is now so peaceful and organized."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-lg font-bold">
                JM
              </div>
              <div>
                <p className="font-semibold">James Mwangi</p>
                <p className="text-white/70 text-sm">Landlord, Nairobi</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-12">
            <div>
              <p className="text-3xl font-heading font-bold">500+</p>
              <p className="text-white/70 text-sm">Properties Managed</p>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold">2,000+</p>
              <p className="text-white/70 text-sm">Happy Tenants</p>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold">98%</p>
              <p className="text-white/70 text-sm">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">Home Zen</span>
          </div>

          {/* Conditional Rendering: Success State vs Form */}
          {isSuccess ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-foreground">Check your email</h2>
              <p className="text-muted-foreground text-lg">
                We've sent a password reset link to <br/>
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
            <>
              {/* Header */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
                  Reset Password
                </h1>
                <p className="text-muted-foreground text-lg">
                  Enter your email address and we'll send you a link to reset your password.
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

                {/* Back to Login Link */}
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
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    🔒
                  </div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    🏠
                  </div>
                  <span>Local</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    💚
                  </div>
                  <span>Trusted</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}