import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import loginHero from "@/assets/login-hero.jpg";

import { useUser } from "@/contexts/UserContext"; 

import { login as loginService } from "@/services/auth";

interface LoginPageProps {
  onLogin?: (email: string, password: string) => Promise<void>;
}

const Login = () => {
  // 3. CHANGE: Get the login helper from your Context
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      // 4. CHANGE: Call the API service (renamed import)r === 1
      const userRespone = await loginService(email, password);
      // console.log("Login successful: ", userRespone);

      const user = {
        role: Number(userRespone.role_id),
        id: userRespone.sub,
        token_exp: userRespone.exp.toString()
      }

      login(user);

      // console.log(user);

      if(user.role === 1) {
        navigate("/");
      } 
      
    } catch (err) {
      const errorMesssage = err.response?.data?.detail || "Login Failed. Please check your credentials";
      setError(errorMesssage)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={loginHero}
          alt="Modern home interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-black/70" />
        
        {/* Content on Image */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold">Home Zen</span>
          </div>
          
          {/* Testimonial */}
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
          
          {/* Bottom Stats */}
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

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">Home Zen</span>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your properties with peace of mind.
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
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "pl-12 pr-12 h-12 text-base",
                    error && !password && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot Password?
              </Link>
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
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
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
          <div className="flex items-center justify-center gap-8 text-muted-foreground">
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
        </div>
      </div>
    </div>
  );
};

export default Login;