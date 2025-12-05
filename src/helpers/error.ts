import { toast } from "sonner";

type ErrorItem = { message?: string };

export function displayErrors(error: unknown, fallbackMessage = "Something went wrong") {
   const errorList = (error as { data?: { errors?: ErrorItem[] } })?.data?.errors;

   if (Array.isArray(errorList) && errorList.length > 0) {
      errorList.forEach((err: ErrorItem) => {
         toast.error(err.message || fallbackMessage);
      });
   } else {
      toast.error(fallbackMessage);
   }

   console.error("Error caught:", error);
}
