import React, { useState } from "react";
import { Button } from "../ui/button";

import generatePDF from "@/utils/generatePdf";
import BorrowerTemplate from "@/template/BorrowerTem";
import { Download } from "lucide-react";

interface Data {
   id: string;
   name: string;
   phone?: string;
   email?: string;
   [key: string]: any;
}

interface Props {
   title: string;
   data: Data[];
   [key: string]: any;
}

/**
 * Component for generating a Borrower PDF Report.
 * Uses the reusable generatePDF() utility with BorrowerTemplate.
 */
const DownloadReport: React.FC<Props> = ({ data, title = "", isDefaulter, ...ref }) => {
   const [loading, setLoading] = useState(false);

   const handleDownload = async () => {
      if (!data || data.length === 0) {
         alert("No  data found to export.");
         return;
      }
      await generatePDF<Data>(data, setLoading, isDefaulter, BorrowerTemplate, {
         reportTitle: title,
         itemsPerPage: 13,
         extraProps: {
            footerNote: "Confidential — For internal use only",
         },
      });
   };

   return (
      <div className="flex items-center gap-2">
         <Button
            {...ref}
            onClick={handleDownload}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium">
            <Download /> {loading ? "Generating PDF..." : "Download Report"}
         </Button>
      </div>
   );
};

export default DownloadReport;
