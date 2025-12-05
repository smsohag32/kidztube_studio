"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useLazyDownloadTemplateQuery } from "@/redux-store/apis_action/report";

interface DownloadTemplateProps {
   /** Button label (default: "Download") */
   title?: string;
   /** API endpoint or identifier for the template */
   api: string;
   /** Optional file name (default: 'report.pdf') */
   fileName?: string;
   /** Any additional props for the button */
   [key: string]: any;
}

/**
 * DownloadTemplate
 * A reusable download button that fetches a file (PDF, Excel, etc.) from API.
 */
const DownloadTemplate = ({
   title = "Download",
   api,
   fileName = "report.pdf",
   ...props
}: DownloadTemplateProps) => {
   const [triggerDownload, { isFetching }] = useLazyDownloadTemplateQuery();
   const [loading, setLoading] = useState(false);

   const handleDownload = async () => {
      try {
         setLoading(true);

         // Fetch file from API
         const blob = await triggerDownload({ api }).unwrap();

         // Create temporary download link
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement("a");
         link.href = url;
         link.download = fileName;
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);

         toast.success(`"${fileName}" downloaded successfully.`);
      } catch (error) {
         console.error("Download failed:", error);
         toast.error("Failed to download the file. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Button
         onClick={handleDownload}
         disabled={loading || isFetching}
         className="flex items-center gap-2"
         {...props}>
         {loading || isFetching ? (
            <>Downloading...</>
         ) : (
            <>
               <Download className="h-4 w-4" />
               {title}
            </>
         )}
      </Button>
   );
};

export default DownloadTemplate;
