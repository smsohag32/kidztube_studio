import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import ErrorPage from "@/pages/404/ErrorPage";
import LoginPage from "@/pages/auth/LoginPage";
import ContentPost from "@/pages/content_managment/conent_post/ContentPost";
import DashboardOverview from "@/pages/Dashboard/DashboardOverview";
import ContentDetails from "@/pages/home_feed/content_details/ContentDetails";
import HomeContentFeedPage from "@/pages/home_feed/HomeContentFeedPage";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
   {
      path: "/",
      element: <MainLayout />,
      children: [
         {
            path: "/",
            element: <HomeContentFeedPage />,
         },
         {
            path: "/content",
            element: <ContentDetails />,
         },
         {
            path: "/content/post",
            element: <ContentPost />,
         },
      ],
   },
   {
      path: "/auth",
      element: <AuthLayout />,
      children: [
         {
            path: "/auth",
            element: <LoginPage />,
         },
      ],
   },
   {
      path: "/dashboard",
      element: (
         // <PrivateRoute>
         <MainLayout />
         // </PrivateRoute>
      ),
      children: [
         {
            path: "/dashboard",
            element: <DashboardOverview />,
         },
      ],
   },
   {
      path: "*",
      element: <ErrorPage />,
   },
]);
