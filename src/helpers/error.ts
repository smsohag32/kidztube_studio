import { toast } from "sonner";

type ErrorItem = { message?: string };

export function displayErrors(error: unknown, fallbackMessage = "Something went wrong") {
   console.error("Error caught:", error);

   const err = error as any;

   // 1. Direct backend message → { message: "URL already exists." }
   if (err?.data?.message) {
      toast.error(err.data.message);
      return;
   }

   // 2. Standard error.message (JS/Fetch/RTKQ)
   if (err?.message) {
      toast.error(err.message);
      return;
   }

   // 3. Backend validation errors:  { errors: [ { message: "..." } ] }
   const errorList = err?.data?.errors;
   if (Array.isArray(errorList) && errorList.length > 0) {
      errorList.forEach((e: ErrorItem) => {
         toast.error(e.message || fallbackMessage);
      });
      return;
   }

   // 4. Fallback message
   toast.error(fallbackMessage);
}
