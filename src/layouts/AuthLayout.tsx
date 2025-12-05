import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

const AuthLayout = () => {
   const { isAuthenticated } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      if (isAuthenticated) {
         navigate("/dashboard", { replace: true });
      }
   }, [isAuthenticated, navigate]);

   return (
      <div>
         {!isAuthenticated && <Outlet />}
         <Toaster
            closeButton
            richColors
         />
      </div>
   );
};

export default AuthLayout;
