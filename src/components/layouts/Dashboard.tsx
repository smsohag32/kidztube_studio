import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Outlet, ScrollRestoration } from "react-router-dom";

import TopBar from "./TopBar";

export default function Dashboard() {
   return (
      <SidebarProvider defaultOpen={false}>
         <AppSidebar className="" />
         <SidebarInset>
            <TopBar />
            <div className="flex  flex-1 mt-1.5 flex-col gap-4 px-4 pb-6 pt-2  rounded-[8px] ">
               <Outlet />
            </div>
            <ScrollRestoration />
         </SidebarInset>
      </SidebarProvider>
   );
}
