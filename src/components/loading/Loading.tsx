"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
   message?: string;
   fullScreen?: boolean;
   className?: string;
}

export default function Loading({
   message = "Loading...",
   fullScreen = true,
   className,
}: LoadingProps) {
   return (
      <div
         className={cn(
            "flex flex-col items-center justify-center gap-4",
            fullScreen ? "h-[80vh] w-full" : "p-6",
            className
         )}>
         <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
         <p className="text-sm text-muted-foreground">{message}</p>
      </div>
   );
}
