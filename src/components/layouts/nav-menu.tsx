"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
   SidebarGroup,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubButton,
   SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface NavItem {
   title: string;
   url: string;
   icon?: LucideIcon;
   requiredPermission?: string | string[];
   items?: {
      title: string;
      url: string;
   }[];
   staticRoles?: any[];
}

export function NavMain({ items }: { items: NavItem[] }) {
   const location = useLocation();

   const isItemActive = (item: NavItem) => {
      return (
         location.pathname === item.url ||
         item.items?.some((subItem) => location.pathname === subItem.url)
      );
   };

   const isSubItemActive = (subItemUrl: string) => {
      return location.pathname === subItemUrl;
   };

   const getMenuButtonStyles = (isActive: boolean) => {
      return cn(
         "group/button relative py-4 cursor-pointer  transition-all duration-300 ease-out transform",
         "hover:scale-[1.02]  hover:shadow-primary/20",
         "hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10",
         "",
         "dark:hover:from-primary/40 dark:hover:to-primary/20 dark:hover:text-primary",
         "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
         "rounded-[8px] border border-transparent hover:border-primary/50 dark:hover:border-primary/50",
         isActive && [
            "bg-gradient-to-r from-primary via-primary  text-primary-foreground to-primary font-semibold",
            "shadow-sm shadow-primary/30 border-primary/20 scale-[1.02]",
            "hover:bg-primary hover:text-primary-foreground hover:via-primary hover:to-primary hover:shadow-xl hover:shadow-primary/40",
            "dark:from-primary dark:via-primary  dark:hover:text-primary-foreground dark:to-primary dark:shadow-primary/20",
            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1",
         ]
      );
   };

   const subMenuTrigger = (isActive: boolean) => {
      return cn(
         "group/button relative  cursor-pointer transition-all duration-300 ease-out py-4 transform",
         "hover:scale-[1.02] hover:shadow-primary/20",
         "hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10",
         "hover:text-primary hover:backdrop-blur-sm",
         "dark:hover:from-primary/40 dark:hover:to-primary/20 dark:hover:text-primary",
         "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
         "rounded-[8px] border border-transparent hover:border-primary/50 dark:hover:border-primary/50",
         isActive && [
            "shadow-sm shadow-primary/30 border-primary/20 scale-[1.02]",
            "hover:shadow-xl hover:shadow-primary/40",
            "dark:from-primary dark:via-primary dark:to-primary dark:shadow-primary/20",
            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1",
         ]
      );
   };

   const getSubMenuButtonStyles = (isActive: boolean) => {
      return cn(
         "block w-full rounded-[8px] cursor-pointer px-4 py-4 text-sm font-medium  transition-all duration-300 ease-out",
         "hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:text-primary",
         "hover:shadow-md hover:shadow-primary/10 hover:scale-[1.00] hover:translate-x-1",
         "dark:hover:from-primary/40 dark:hover:to-primary/20 dark:hover:text-primary",
         "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
         "border border-transparent hover:border-primary/30 dark:hover:border-primary/30",
         "relative overflow-hidden",
         isActive && [
            "bg-gradient-to-r from-primary to-primary font-semibold shadow-md shadow-primary/25",
            "hover:from-primary hover:to-primary hover:shadow-primary/35",
            "dark:from-primary dark:to-primary border-primary/20",
            "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
            "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
         ]
      );
   };

   return (
      <SidebarGroup>
         <SidebarMenu className="space-y-2">
            {items.map((item) => {
               const isActive = isItemActive(item);
               const hasSubItems = item.items && item.items.length > 0;

               return (
                  <Collapsible
                     key={item.title}
                     asChild
                     defaultOpen={isActive}
                     className="group/collapsible">
                     <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                           {hasSubItems ? (
                              <SidebarMenuButton
                                 tooltip={item.title}
                                 className={subMenuTrigger(!!isActive)}>
                                 {item.icon && (
                                    <item.icon className="h-5 w-5 shrink-0 transition-all duration-300 group-hover/button:scale-110" />
                                 )}
                                 <span className="truncate font-medium">{item.title}</span>
                                 <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-all duration-300 group-data-[state=open]/collapsible:rotate-90 group-hover/button:scale-110" />
                              </SidebarMenuButton>
                           ) : (
                              <NavLink
                                 to={item.url}
                                 className="block">
                                 <SidebarMenuButton
                                    tooltip={item.title}
                                    className={getMenuButtonStyles(!!isActive)}>
                                    {item.icon && (
                                       <item.icon className="h-5 w-5 shrink-0 transition-all duration-300 group-hover/button:scale-110" />
                                    )}
                                    <span className="truncate font-medium">{item.title}</span>
                                 </SidebarMenuButton>
                              </NavLink>
                           )}
                        </CollapsibleTrigger>

                        {hasSubItems && (
                           <CollapsibleContent className="overflow-hidden w-full  data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                              <SidebarMenuSub className=" space-y-1 mt-2 border-l-2 border-primary/25 px-4 w-full dark:border-primary/40 relative">
                                 {item.items!.map((subItem) => {
                                    const subItemActive = isSubItemActive(subItem.url);
                                    return (
                                       <SidebarMenuSubItem key={subItem.title}>
                                          <SidebarMenuSubButton asChild>
                                             <NavLink
                                                to={subItem.url}
                                                className={getSubMenuButtonStyles(subItemActive)}>
                                                <span className="truncate relative z-10">
                                                   {subItem.title}
                                                </span>
                                             </NavLink>
                                          </SidebarMenuSubButton>
                                       </SidebarMenuSubItem>
                                    );
                                 })}
                              </SidebarMenuSub>
                           </CollapsibleContent>
                        )}
                     </SidebarMenuItem>
                  </Collapsible>
               );
            })}
         </SidebarMenu>
      </SidebarGroup>
   );
}
