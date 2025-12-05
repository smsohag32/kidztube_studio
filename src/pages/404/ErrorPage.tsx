import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
   const navigate = useNavigate();

   return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
         {/* Icon Section */}
         <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-100 shadow-md animate-bounce mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
         </div>

         {/* Title */}
         <h1 className="text-5xl font-extrabold text-slate-800 drop-shadow-sm">404</h1>
         <h2 className="text-2xl font-semibold text-slate-700 mt-2">Page Not Found</h2>

         {/* Description */}
         <p className="text-slate-500 mt-3 max-w-md text-center leading-relaxed">
            Oops! The page you’re looking for doesn’t exist or has been moved. Let’s get you back on
            track.
         </p>

         {/* Button */}
         <Button
            onClick={() => navigate("/")}
            className="mt-8 px-6 py-2 text-base flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
            <Home className="h-4 w-4" /> Back to Home
         </Button>
      </div>
   );
};

export default ErrorPage;
