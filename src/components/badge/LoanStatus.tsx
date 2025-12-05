import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LoanStatusProps {
   status?: string;
}

const LoanStatus = ({ status }: LoanStatusProps) => {
   if (!status) return null;

   const styles = {
      "Bad & Loss": "bg-red-100 text-red-800 border-red-300",
      "Write off": "bg-green-100 text-green-800 border-green-300",
      Default: "bg-gray-100 text-gray-800 border-gray-300",
   };

   const labels: Record<string, string> = {
      "Bad & Loss": " Bad & Loss",
      "Write off": "Write Off",
   };

   const isCombined =
      status.toLowerCase().includes("bad") && status.toLowerCase().includes("write");

   return (
      <Badge
         variant="outline"
         className={cn(
            "inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full border shadow-sm",
            isCombined
               ? "bg-rose-100 text-rose-800 border-rose-300"
               : styles[status as keyof typeof styles] || styles.Default
         )}>
         {isCombined ? "💼 Bad & Loss – Write-Off" : labels[status] ?? `${status}`}
      </Badge>
   );
};

export default LoanStatus;
