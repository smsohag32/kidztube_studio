"use client";

import type * as React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-sitcher";
import { NavMain } from "./nav-menu";
import { NavUser } from "./nav-user";

import { House, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { filterNavItems, permissionHelper } from "@/helpers/permissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const menuItems = [
      {
         title: "Home",
         url: "/",
         icon: House,
      },
      {
         title: "Post Content",
         url: "/content/post",
         icon: Plus,
      },
   ];

   const { user } = useAuth();
   const { hasPermission } = permissionHelper(user?.permissions);
   const filteredNav = filterNavItems(menuItems, hasPermission, user?.role?.name);

   return (
      <Sidebar
         collapsible="icon"
         variant="floating"
         {...props}>
         <SidebarHeader>
            <TeamSwitcher />
         </SidebarHeader>

         <SidebarContent>
            <NavMain items={filteredNav} />
         </SidebarContent>

         <SidebarFooter>
            <NavUser />
         </SidebarFooter>
      </Sidebar>
   );
}
