import logo from "@/assets/logo/logo2.svg";
import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import { Sparkles } from "lucide-react";

export function TeamSwitcher() {
   return (
      <SidebarMenu>
         <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent/80 -mt-1 items-center data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all rounded-xl p-2">
            <div className="relative flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-1.5 ring-1 ring-primary/20 shadow-xs">
               <img
                  src={logo}
                  className="w-full h-full object-contain"
                  alt="KidzTube Studio"
               />
               <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
               </span>
            </div>
            <div className="grid flex-1 justify-start items-center text-left leading-tight pl-1">
               <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-bold bg-gradient-to-r from-primary via-indigo-500 to-sky-400 bg-clip-text text-transparent tracking-tight">
                     KidzTube
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
                     <Sparkles className="h-2.5 w-2.5" />
                     STUDIO
                  </span>
               </div>
               <span className="truncate text-xs text-muted-foreground font-normal">
                  Safe Video Platform
               </span>
            </div>
         </SidebarMenuButton>
         <Separator className="my-1.5 opacity-60" />
      </SidebarMenu>
   );
}

