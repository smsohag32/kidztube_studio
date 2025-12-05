import { useState, useRef, useEffect } from "react";
import { Bell, Maximize, Settings, LogOut } from "lucide-react";
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

const TopBar = () => {
   const [isProfileOpen, setIsProfileOpen] = useState(false);
   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
   // Removed unused isFullscreen state
   const profileRef = useRef<HTMLDivElement>(null);
   const notificationRef = useRef<HTMLDivElement>(null);
   const location = useLocation();
   const navigate = useNavigate();
   const { user } = useAuth();
   const dispatch = useDispatch<AppDispatch>();
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

   const notifications = [{ id: 1, title: "System  Running", time: "2 min ago", unread: false }];

   const unreadCount = notifications.filter((n) => n.unread).length;

   const handleLogout = async () => {
      dispatch(logoutUser());

      navigate("/", { replace: true });
   };
   return (
      <header className="flex h-16 border-b   shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
         <div className="flex justify-between w-full items-center gap-4 px-4">
            <div className="flex items-center gap-3">
               <SidebarTrigger className="-ml-1" />
               <Separator
                  orientation="vertical"
                  className="mr-2  !h-4"
               />
               <Breadcrumb className="hidden md:block">
                  <BreadcrumbList>
                     {pathSegments.map((segment, index) => {
                        const href = "/" + pathSegments.slice(0, index + 1).join("/");
                        const isLast = index === pathSegments.length - 1;
                        return (
                           <BreadcrumbItem key={href}>
                              {isLast ? (
                                 <BreadcrumbPage>{formatBreadcrumb(segment)}</BreadcrumbPage>
                              ) : (
                                 <>
                                    <BreadcrumbLink to={href}>
                                       {formatBreadcrumb(segment)}
                                    </BreadcrumbLink>
                                    <BreadcrumbSeparator />
                                 </>
                              )}
                           </BreadcrumbItem>
                        );
                     })}
                  </BreadcrumbList>
               </Breadcrumb>
            </div>
            <div className="flex items-center gap-3">
               <div
                  className="relative"
                  ref={notificationRef}>
                  <button
                     onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                     className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                     <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                     {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                           {unreadCount}
                        </span>
                     )}
                  </button>

                  {isNotificationOpen && (
                     <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                           <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Notifications
                           </h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                           {notifications.map((notification) => (
                              <div
                                 key={notification.id}
                                 className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                 <div className="flex items-start gap-3">
                                    <div
                                       className={`w-2 h-2 rounded-full mt-2 ${
                                          notification.unread ? "bg-primary" : "bg-gray-300"
                                       }`}
                                    />
                                    <div className="flex-1">
                                       <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                          {notification.title}
                                       </p>
                                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {notification.time}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                           <button className="w-full text-center text-sm text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                              View all notifications
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <Maximize className="h-5 w-5 text-gray-600 dark:text-gray-400" />
               </button>

               <div
                  className="relative"
                  ref={profileRef}>
                  <button
                     onClick={() => setIsProfileOpen(!isProfileOpen)}
                     className="flex items-center gap-2 p-1  rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                     <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center  text-xs font-semibold">
                        {user?.username?.slice(0, 2).toUpperCase() || "US"}
                     </div>
                  </button>

                  {isProfileOpen && (
                     <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center  text-sm font-semibold">
                                 {user?.username?.slice(0, 2).toUpperCase() || "US"}
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {user?.fullName || "Sohag Sheik"}
                                 </p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="py-2">
                           <Link
                              to={"/dashboard/profile-settings"}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <Settings className="h-4 w-4" />
                              Account Settings
                           </Link>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                           <button
                              onClick={handleLogout}
                              className="flex items-center cursor-pointer gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <LogOut className="h-4 w-4" />
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
