import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

import type { ReactNode } from "react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
   const { user, isLoading, token } = useAuth();
   if (isLoading) return;
   if (!user && !token && !isLoading)
      return (
         <Navigate
            to="/"
            replace
         />
      );
   return children;
};

export default PrivateRoute;
