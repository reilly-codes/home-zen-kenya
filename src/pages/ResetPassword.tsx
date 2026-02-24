import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import loginHero from '@/assets/login-hero.jpg'; 
import { api } from '@/services/api';


export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Type inference handles these string values perfectly
  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: ''
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Explicitly tell TS this can be a string or null
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Type the input change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.id]: e.target.value
    });
  };

  // Type the form submission event
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
     await api.post('/users/reset-password', {
        secret_token: token,
        new_password: passwords.new_password,
        confirm_password: passwords.confirm_password
      });
      
      setIsSuccess(true);
    } catch (err: any) {
      // Note: If you use Axios, you can type this as: (err: AxiosError)
      setError(err.response?.data?.detail || "Failed to reset password. The link might be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* <img
          src={loginHero}
          alt="Modern home interior"
          className="absolute inset-0 w-full h-full object-cover"
        /> */}
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
          </div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-foreground">Password Updated!</h2>
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
            /* Missing Token Error State */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-foreground">Invalid Link</h2>
              <p className="text-muted-foreground text-lg">
                This password reset link is invalid or missing the security token. Please request a new link.
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
            /* The Reset Form */
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
                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* New Password Field */}
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

                {/* Confirm Password Field */}
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
        </div>
      </div>
    </div>
  );
}