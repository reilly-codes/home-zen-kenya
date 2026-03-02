import { ReactNode } from "react";
import { Home } from "lucide-react";
import loginHero from '@/assets/login-hero.jpg';

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex bg-background">

            {/* ===== LEFT SIDE — Hero Panel (defined once, used by all auth pages) ===== */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src={loginHero}
                    alt="Modern home interior"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-black/70" />

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

                    {/* Stats */}
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

            {/* ===== RIGHT SIDE — Each page puts its form here via children ===== */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md space-y-8">

                    {/* Mobile Logo — shown when the left panel is hidden on small screens */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Home className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-2xl font-heading font-bold text-foreground">Home Zen</span>
                    </div>

                    {/* The form from whichever page is using this layout */}
                    {children}
                </div>
            </div>

        </div>
    );
}
