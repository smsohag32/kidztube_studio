import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useLazyDownloadTopDefaulterQuery } from "@/redux-store/apis_action/report";

interface DownloadTopDefaultersProps {
   title?: string;
   id?: string;
   [key: string]: any;
}

const DownloadTopDefaulters = ({ title = "Download", id, ...ref }: DownloadTopDefaultersProps) => {
   const [triggerDownload, { isFetching }] = useLazyDownloadTopDefaulterQuery();
   const [loading, setLoading] = useState(false);

   const handleDownload = async () => {
      try {
         setLoading(true);
         const blob = await triggerDownload("").unwrap();
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement("a");
         link.href = url;
         link.setAttribute("download", `top_defaulters_${id}.pdf`);
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
         toast.success("Download successful!");
      } catch (error) {
         console.error("Download failed:", error);
         toast.error("Failed to download top defaulters.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="w-full">
         <Button
            onClick={handleDownload}
            disabled={loading || isFetching}
            {...ref}>
            {loading || isFetching ? (
               "Downloading..."
            ) : (
               <>
                  <Download /> {title}
               </>
            )}
         </Button>
      </div>
   );
};

export default DownloadTopDefaulters;
