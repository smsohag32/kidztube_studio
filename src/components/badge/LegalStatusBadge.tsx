import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LegalStatusBadgeProps {
   status?: string;
}

export function LegalStatusBadge({ status }: LegalStatusBadgeProps) {
   if (!status) return null;

   const styles = {
      Review: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Sent to legal division": "bg-blue-100 text-blue-800 border-blue-300",
      Taken: "bg-green-100 text-green-800 border-green-300",
      Default: "bg-gray-100 text-gray-800 border-gray-300",
   };

   const labels: Record<string, string> = {
      Review: "🕓 Legal Action: Under Review",
      "Sent to legal division": "📤 Legal Action: Forwarded to Legal Division",
      Taken: "⚖️ Legal Action: Taken by Legal Division",
   };

   return (
      <Badge
         variant="outline"
         className={cn(
            "inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border shadow-sm",
            styles[status as keyof typeof styles] || styles.Default
         )}>
         {labels[status] ?? `Legal Action: ${status}`}
      </Badge>
   );
}
