import ContentContainer from "./ContentContainer";
import { Link } from "react-router-dom";
import { Sparkles, Plus, PlaySquare, ShieldCheck, Flame } from "lucide-react";

const HomeContentFeedPage = () => {
   return (
      <div className="space-y-5">
         {/* Studio Header Banner */}
         <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-sky-500/5 to-indigo-500/10 p-5 sm:p-6 shadow-xs">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                     <Sparkles className="w-3.5 h-3.5" />
                     <span>Curated for Kids • 100% Safe</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                     KidzTube Studio Feed
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                     Discover, review, and manage verified learning & cartoon videos for young learners.
                  </p>
               </div>

               <div className="flex flex-wrap items-center gap-2.5">
                  <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xs border border-border/60 text-xs">
                     <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Kid-Safe Certified</span>
                     </div>
                     <span className="text-border">|</span>
                     <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                        <Flame className="w-4 h-4" />
                        <span>Active Stream</span>
                     </div>
                  </div>

                  <Link
                     to="/content/post"
                     className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-all duration-200">
                     <Plus className="w-4 h-4" />
                     <span>Publish Video</span>
                  </Link>
               </div>
            </div>

            {/* Ambient decorative blur */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
         </div>

         {/* Content Feed Container */}
         <ContentContainer />
      </div>
   );
};

export default HomeContentFeedPage;

