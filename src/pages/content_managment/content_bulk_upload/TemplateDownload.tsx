"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TemplateDownloadProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   title?: string;
}

const TemplateDownload: React.FC<TemplateDownloadProps> = ({
   title = "Download Template",
   ...props
}) => {
   const handleDownload = () => {
      const link = document.createElement("a");
      link.href = "/content_template/content_template.xlsx";
      link.download = "content_template.xlsx";
      link.click();
   };

   return (
      <Button
         onClick={handleDownload}
         {...props}>
         <Download className="mr-2" /> {title}
      </Button>
   );
};

export default TemplateDownload;
