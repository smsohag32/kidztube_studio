import { Button } from "@/components/ui/button";
import { Home, Compass, Film, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
   const navigate = useNavigate();

   return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-background text-center overflow-hidden">
         {/* Ambient Background orbs */}
         <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
         <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

         <div className="relative z-10 max-w-md space-y-6">
            {/* Animated Icon Badge */}
            <div className="relative inline-flex items-center justify-center size-24 rounded-3xl bg-primary/10 text-primary shadow-lg ring-1 ring-primary/20 mx-auto">
               <Film className="h-12 w-12" />
               <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
               </span>
            </div>

            {/* Error Code & Copy */}
            <div className="space-y-2">
               <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>404 Video Not Found</span>
               </div>
               <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Oops! Page Wandered Off
               </h1>
               <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  The video or page you're searching for might have been moved or doesn't exist anymore. Let's get you back to the fun!
               </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
               <Button
                  onClick={() => navigate("/")}
                  className="rounded-xl px-5 h-11 text-xs font-bold gap-2 shadow-md hover:shadow-lg transition-all">
                  <Home className="h-4 w-4" />
                  <span>Back to Home Feed</span>
               </Button>
               <Button
                  variant="outline"
                  onClick={() => navigate("/content-management")}
                  className="rounded-xl px-5 h-11 text-xs font-semibold gap-2 border-border/80">
                  <Compass className="h-4 w-4" />
                  <span>Explore Catalog</span>
               </Button>
            </div>
         </div>
      </div>
   );
};

export default ErrorPage;

