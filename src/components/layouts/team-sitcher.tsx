import logo from "@/assets/logo/logo2.svg";
import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";

export function TeamSwitcher() {
   return (
      <SidebarMenu>
         <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent  -mt-1  items-center data-[state=open]:text-sidebar-accent-foreground">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
               <img
                  src={logo}
                  className="w-full object-contain"
                  alt="Board  Flow"
               />
            </div>
            <div className="grid flex-1 justify-start  items-center text-left text-sm font-semibold leading-tight">
               <span className="truncate flex-col flex w-full text-[22px] pb-[3px]  ">
                  <span className="text-[18px] font-bold">KidzTube</span>{" "}
                  <span className="text-sm">Studio</span>
               </span>
               {/* <span className="truncate text-xs">p2m</span> */}
            </div>
            {/* <ChevronsUpDown className="ml-auto" /> */}
         </SidebarMenuButton>
         <Separator />
      </SidebarMenu>
   );
}
