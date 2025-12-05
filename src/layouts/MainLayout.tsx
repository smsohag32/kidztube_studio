import Dashboard from "@/components/layouts/Dashboard";
import { Toaster } from "sonner";

const MainLayout = () => {
   return (
      <>
         <Dashboard />
         <Toaster
            closeButton
            position="bottom-right"
            richColors
         />
      </>
   );
};

export default MainLayout;
