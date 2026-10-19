import { useState, useRef, useEffect } from "react";
import { Bell, Maximize, Settings, LogOut, PlusCircle, CheckCheck } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatBreadcrumb } from "@/lib/utils";
import { logoutUser } from "@/redux-store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux-store";
import ThemeToggle from "../ui/theme-toggle";
import { Button } from "../ui/button";
import SearchBox from "./SearchBox";

const TopBar = () => {
   const [isProfileOpen, setIsProfileOpen] = useState(false);
   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
   const profileRef = useRef<HTMLDivElement>(null);
   const notificationRef = useRef<HTMLDivElement>(null);
   const location = useLocation();
   const navigate = useNavigate();
   const { user } = useAuth();
   const dispatch = useDispatch<AppDispatch>();

   const [notificationsList, setNotificationsList] = useState([
      { id: 1, title: "Welcome to KidzTube Studio!", time: "Just now", unread: true },
      { id: 2, title: "Video pipeline is active and running", time: "10 min ago", unread: false },
   ]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
         }
         if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setIsNotificationOpen(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const pathSegments = location.pathname.split("/").filter(Boolean);

   const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
         document.documentElement.requestFullscreen();
      } else {
         document.exitFullscreen();
      }
   };

   const unreadCount = notificationsList.filter((n) => n.unread).length;

   const markAllAsRead = () => {
      setNotificationsList((prev) => prev.map((item) => ({ ...item, unread: false })));
   };

   const handleLogout = async () => {
      dispatch(logoutUser());
      navigate("/", { replace: true });
   };

   return (
      <header className="flex sticky top-0 bg-background/85 backdrop-blur-md z-40 h-16 border-b border-border/40 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
         <div className="flex justify-between w-full items-center gap-3 px-4">
            <div className="flex items-center gap-2.5">
               <SidebarTrigger className="-ml-1 hover:bg-muted/80 rounded-lg transition-colors" />
               <Separator
                  orientation="vertical"
                  className="mr-1 !h-4 opacity-50"
               />
               <Breadcrumb className="hidden md:block">
                  <BreadcrumbList className="inline-block max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
                     {pathSegments.length === 0 ? (
                        <BreadcrumbItem className="inline-block align-middle">
                           <BreadcrumbPage className="font-medium text-xs text-foreground/80">
                              Studio Feed
                           </BreadcrumbPage>
                        </BreadcrumbItem>
                     ) : (
                        pathSegments.map((segment, index) => {
                           const href = "/" + pathSegments.slice(0, index + 1).join("/");
                           const isLast = index === pathSegments.length - 1;

                           return (
                              <BreadcrumbItem
                                 key={href}
                                 className="inline-block align-middle text-xs">
                                 {isLast ? (
                                    <BreadcrumbPage className="inline-block align-middle font-semibold text-foreground">
                                       {formatBreadcrumb(segment)}
                                    </BreadcrumbPage>
                                 ) : (
                                    <>
                                       <BreadcrumbLink
                                          to={href}
                                          className="inline-block align-middle whitespace-nowrap text-muted-foreground hover:text-foreground">
                                          {formatBreadcrumb(segment)}
                                       </BreadcrumbLink>
                                       <BreadcrumbSeparator className="inline-block mx-1.5 flex-shrink-0 opacity-60" />
                                    </>
                                 )}
                              </BreadcrumbItem>
                           );
                        })
                     )}
                  </BreadcrumbList>
               </Breadcrumb>
            </div>

            <SearchBox />

            <div className="flex items-center gap-2">
               {/* Quick Create Button */}
               <Link
                  to="/content/post"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all duration-200">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create</span>
               </Link>

               <ThemeToggle />

               {/* Notifications */}
               <div
                  className="relative"
                  ref={notificationRef}>
                  <Button
                     onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                     variant="ghost"
                     size="icon"
                     aria-label="Open notifications"
                     className="relative rounded-full h-9 w-9 text-muted-foreground hover:text-foreground">
                     <Bell className="h-4 w-4" />
                     {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background" />
                     )}
                  </Button>

                  {isNotificationOpen && (
                     <div className="absolute right-0 mt-2 w-80 bg-popover/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                        <div className="p-3.5 border-b border-border/40 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-foreground">
                                 Notifications
                              </h3>
                              {unreadCount > 0 && (
                                 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">
                                    {unreadCount} new
                                 </span>
                              )}
                           </div>
                           {unreadCount > 0 && (
                              <button
                                 onClick={markAllAsRead}
                                 className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium">
                                 <CheckCheck className="w-3 h-3" /> Mark read
                              </button>
                           )}
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-border/20">
                           {notificationsList.map((notification) => (
                              <div
                                 key={notification.id}
                                 className={`p-3.5 hover:bg-muted/50 transition-colors ${
                                    notification.unread ? "bg-primary/5" : ""
                                 }`}>
                                 <div className="flex items-start gap-2.5">
                                    <div
                                       className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                          notification.unread ? "bg-primary" : "bg-muted-foreground/30"
                                       }`}
                                    />
                                    <div className="flex-1">
                                       <p className="text-xs font-medium text-foreground leading-snug">
                                          {notification.title}
                                       </p>
                                       <p className="text-[11px] text-muted-foreground mt-0.5">
                                          {notification.time}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               {/* Fullscreen Button */}
               <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle fullscreen"
                  className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                  <Maximize className="h-4 w-4" />
               </Button>

               {/* User Profile */}
               <div
                  className="relative"
                  ref={profileRef}>
                  <Button
                     onClick={() => setIsProfileOpen(!isProfileOpen)}
                     variant="ghost"
                     size="icon"
                     aria-label="User menu"
                     className="rounded-full h-9 w-9 p-0.5 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                     <div className="h-full w-full rounded-full bg-gradient-to-tr from-primary to-sky-400 text-primary-foreground flex items-center justify-center text-xs font-bold shadow-xs">
                        {user?.username?.slice(0, 2).toUpperCase() || "KT"}
                     </div>
                  </Button>

                  {isProfileOpen && (
                     <div className="absolute right-0 mt-2 w-60 bg-popover/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                        <div className="p-3.5 border-b border-border/40">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-sky-400 text-primary-foreground flex items-center justify-center text-sm font-bold shadow-xs flex-shrink-0">
                                 {user?.username?.slice(0, 2).toUpperCase() || "KT"}
                              </div>
                              <div className="overflow-hidden">
                                 <p className="text-xs font-bold text-foreground truncate">
                                    {user?.fullName || "KidzTube Creator"}
                                 </p>
                                 <p className="text-[11px] text-muted-foreground truncate">
                                    {user?.email || "creator@kidztube.com"}
                                 </p>
                                 <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                                    {user?.role?.name || "Content Creator"}
                                 </span>
                              </div>
                           </div>
                        </div>

                        <div className="p-1">
                           <Link
                              to={"/content-management"}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/70 transition-colors">
                              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                              Manage Content
                           </Link>
                        </div>

                        <div className="border-t border-border/40 p-1">
                           <button
                              onClick={handleLogout}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                              <LogOut className="h-3.5 w-3.5" />
                              Logout
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </header>
   );
};

export default TopBar;

