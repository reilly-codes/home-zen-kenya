import { Link } from "react-router-dom";
import { Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        {/* Friendly Icon */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-card rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
            <div className="relative">
              <Home className="h-12 w-12 text-primary" />
              <HelpCircle className="h-6 w-6 text-muted-foreground absolute -top-1 -right-2" />
            </div>
          </div>
        </div>

        {/* Friendly Copy */}
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Oops! This room is vacant.
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          We couldn't find the page you're looking for. It might have moved or doesn't exist.
        </p>

        {/* Action Button */}
        <Link to="/">
          <Button size="lg" className="rounded-2xl px-8 py-6 text-lg font-semibold hover:scale-105 transition-transform">
            <Home className="mr-2 h-5 w-5" />
            Return to Dashboard
          </Button>
        </Link>

        {/* Subtle decoration */}
        <p className="text-sm text-muted-foreground/60 mt-8">
          Error 404 • Page Not Found
        </p>
      </div>
    </div>
  );
};

export default NotFound;