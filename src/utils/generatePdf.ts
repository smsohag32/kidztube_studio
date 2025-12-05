import { jsPDF } from "jspdf";
import { createRoot } from "react-dom/client";
import moment from "moment";
import generatePageImage from "./generatePageImage";
import React from "react";

interface GeneratePDFOptions {
   reportTitle?: string;
   itemsPerPage?: number;
   isDefaulter?: boolean;
   extraProps?: Record<string, any>;
   [key: string]: any;
}

const generatePDF = async <T>(
   data: T[],
   setLoading: (val: boolean) => void,
   isDefaulter: any,
   TemplateComponent: React.ComponentType<any>,
   options: GeneratePDFOptions = {}
): Promise<void> => {
   const { reportTitle = "Report", itemsPerPage = 15, extraProps = {} } = options;

   setLoading(true);

   try {
      if (!data?.length) return;

      const totalPages = Math.ceil(data.length / itemsPerPage);
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
         const slice = data.slice(pageNum * itemsPerPage, (pageNum + 1) * itemsPerPage);

         const tempDiv = document.createElement("div");
         tempDiv.style.position = "fixed";
         tempDiv.style.left = "-9999px";
         tempDiv.style.width = `${pageWidth}mm`;
         tempDiv.style.height = `${pageHeight}mm`;
         document.body.appendChild(tempDiv);

         createRoot(tempDiv).render(
            React.createElement(TemplateComponent, {
               ...extraProps,
               data: slice,
               title: reportTitle,
               date: moment().format("LL"),
               pageNumber: pageNum + 1,
               totalPages,
               isDefaulter,
               startIndex: pageNum * itemsPerPage,
            })
         );

         await new Promise((r) => setTimeout(r, 400));

         const imgData = await generatePageImage(tempDiv);
         document.body.removeChild(tempDiv);

         if (pageNum > 0) pdf.addPage();
         pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "SLOW");
      }

      pdf.save(`${reportTitle}-${moment().format("YYYYMMDD-HHmmss")}.pdf`);
   } finally {
      setLoading(false);
   }
};

export default generatePDF;
