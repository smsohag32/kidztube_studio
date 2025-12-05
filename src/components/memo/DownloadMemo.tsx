"use client";

import { Button } from "@/components/ui/button";
import { useLazyDownloadMemoQuery } from "@/redux-store/apis_action/memo";
import { Download } from "lucide-react";

const DownloadMemo = ({ loanId, title = "Memo" }: { loanId: string; title?: string }) => {
   const [triggerDownload, { isFetching }] = useLazyDownloadMemoQuery();

   const handleDownload = async () => {
      try {
         const blob = await triggerDownload(loanId).unwrap();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = `legal-memo-${loanId}.pdf`;
         document.body.appendChild(a);
         a.click();
         a.remove();
         window.URL.revokeObjectURL(url);
      } catch (error) {
         console.error("Failed to download memo:", error);
      }
   };

   return (
      <Button
         onClick={handleDownload}
         disabled={isFetching}
         className="flex items-center w-full justify-center gap-2">
         <Download className="w-3 h-3" />
         {isFetching ? "Downloading..." : title}
      </Button>
   );
};

export default DownloadMemo;
