"use client";

import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux-store/slices/authSlice";

export function NavUser() {
   const { isMobile } = useSidebar();
   const { user } = useAuth();
   const navigate = useNavigate();
   const dispatch = useDispatch();
   // console.log(user);
   const handleLogout = async () => {
      dispatch(logoutUser());
      navigate("/", { replace: true });
   };
   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                     size="lg"
                     className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ring-0 outline-none">
                     <Avatar className="h-8 w-8 rounded-sm bg-primary">
                        <AvatarImage
                           src={""}
                           alt={"User Avatar"}
                        />
                        <AvatarFallback className="rounded-lg text-sm bg-primary text-primary-foreground ">
                           {user?.username?.slice(0, 2).toUpperCase() || "SO"}
                        </AvatarFallback>
                     </Avatar>
                     <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                           {user?.fullName || "Sohag Sheik"}
                        </span>
                        <span className="truncate text-xs">{user?.email || "sohagsheik32"}</span>
                     </div>
                     <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
               </DropdownMenuTrigger>
               <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}>
                  <DropdownMenuLabel className="p-0 font-normal">
                     <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                           <AvatarImage
                              src={""}
                              alt={"user avatar"}
                           />
                           <AvatarFallback className="rounded-lg">
                              {user?.username?.slice(0, 2).toUpperCase() || "US"}
                           </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                           <span className="truncate font-semibold">{user?.fullName}</span>
                           <span className="truncate text-xs">{user?.fullName}</span>
                        </div>
                     </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                     <DropdownMenuItem
                        onClick={() => navigate("/dashboard/profile-settings")}
                        className="cursor-pointer">
                        <BadgeCheck />
                        Account
                     </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                     onClick={handleLogout}
                     className="cursor-pointer">
                     <LogOut />
                     Log out
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}
