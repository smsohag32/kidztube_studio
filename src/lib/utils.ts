import { displayErrors } from "@/helpers/error";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export const formatBreadcrumb = (segment: string) => {
   return segment
      .replace(/[-_]/g, " ") // replace - and _ with space
      .split(" ") // split into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
};

export const formatTxnDate = () => {
   const now = new Date();
   const pad = (n: number) => n.toString().padStart(2, "0");

   const yy = now.getFullYear().toString().slice(-2);
   const MM = pad(now.getMonth() + 1);
   const dd = pad(now.getDate());
   const HH = pad(now.getHours());
   const mm = pad(now.getMinutes());
   const ss = pad(now.getSeconds());

   return `${yy}${MM}${dd}${HH}${mm}${ss}`;
};

export const formatCurrency = (amount: number) => {
   if (isNaN(amount)) return "৳0.00";
   const absAmount = Math.abs(amount);
   if (absAmount >= 1_00_00_000) {
      return "BDT" + (amount / 1_00_00_000).toFixed(2) + " Cr";
   }

   // Otherwise normal BDT formatting
   return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
   }).format(amount);
};

export const displayValue = (val: any) => (val ? String(val) : "—");

export const copyToClipboard = async (text: any) => {
   if (!text) return;
   try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
   } catch (err) {
      displayErrors(err);
   }
};

export const getStatusBadgeClass = (status?: string) => {
   switch (status?.toLowerCase()) {
      case "answered":
         return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "sent":
      case "SENT":
         return "bg-green-50 text-green-700 border border-green-200";
      case "processing":
         return "bg-amber-50 text-amber-700 border border-amber-200";
      case "failed":
         return "bg-red-50 text-red-700 border border-red-200";
      case "no_answer":
         return "bg-orange-50 text-orange-600 border border-orange-200";
      case "rejected":
         return "bg-red-100 text-red-700 border border-red-200";
      default:
         return "bg-gray-100 text-gray-700 border border-gray-200";
   }
};
