import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
   status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status = "Unknown" }) => {
   const getBadgeStyle = (status: string) => {
      switch (status) {
         case "Unclassified":
            return "bg-green-100 text-green-800 hover:bg-green-100";
         case "Substandard":
            return "bg-orange-100 text-orange-800 hover:bg-orange-100";
         case "Doubtful":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
         case "Bad Loan":
            return "bg-red-100 text-red-800 hover:bg-red-100";
         default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      }
   };

   return <Badge className={getBadgeStyle(status)}>{status}</Badge>;
};

export default StatusBadge;
