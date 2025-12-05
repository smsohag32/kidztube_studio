import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useLazyDownloadTopBorrowerQuery } from "@/redux-store/apis_action/report";

interface props {
   title?: string;
   id?: string;
   [key: string]: any;
}

const DownloadTopBorrowers = ({ title = "Download", id, ...ref }: props) => {
   const [triggerDownload, { isFetching }] = useLazyDownloadTopBorrowerQuery();
   const [loading, setLoading] = useState(false);

   const handleDownload = async () => {
      try {
         setLoading(true);
         const blob = await triggerDownload("").unwrap();
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement("a");
         link.href = url;
         link.setAttribute("download", `top_borrowers_${id}.pdf`);
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
         toast.success("Download successful!");
      } catch (error) {
         console.error("Download failed:", error);
         toast.error("Failed to download top borrowers.");
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

export default DownloadTopBorrowers;
