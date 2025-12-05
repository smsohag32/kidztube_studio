import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, AlertCircle } from "lucide-react";
import { Separator } from "../ui/separator";
import { useDocumentPreviewQuery } from "@/redux-store/apis_action/customer";

interface PreviewDocumentSheetProps {
   isOpen: boolean;
   setIsOpen: (open: boolean) => void;
   document?: {
      id: string | number | null;
      name?: string;
      type?: string;
      serial?: number;
      updatedAt?: string | null;
      version?: string | null;
   } | null;
}

const PreviewDocumentSheet = ({
   isOpen,
   setIsOpen,
   document: fileDocument,
}: PreviewDocumentSheetProps) => {
   console.log("DocumentPreviewSheet - fileDocument:", fileDocument);
   // 🧩 If no document, skip querying and show alert
   const isDocumentValid = !!fileDocument?.id && !!fileDocument?.name;

   const { data, isLoading, error } = useDocumentPreviewQuery(
      { id: fileDocument?.id ?? null },
      { skip: !isDocumentValid }
   );

   const extension = useMemo(
      () => fileDocument?.name?.split(".").pop()?.toLowerCase() || "",
      [fileDocument?.name]
   );

   const fileUrl = useMemo(() => {
      if (data) {
         return URL.createObjectURL(data);
      }
      return null;
   }, [data]);

   const handleDownload = () => {
      if (!fileUrl) return;
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileDocument?.name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   return (
      <Sheet
         open={isOpen}
         onOpenChange={setIsOpen}>
         <SheetContent className="flex flex-col !max-w-3/4 h-full w-full">
            <SheetHeader className="flex items-center lg:flex-row  justify-between border-b border-gray-200 px-6 py-4">
               <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <SheetTitle className="text-lg font-semibold">
                     {isDocumentValid ? fileDocument?.name : "No Document Found"}
                  </SheetTitle>
               </div>

               <div className="flex items-center gap-2 pe-10">
                  <Button
                     onClick={handleDownload}
                     disabled={!fileUrl || !isDocumentValid}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                     <Download className="h-4 w-4" />
                     Download
                  </Button>
                  <Separator
                     orientation="vertical"
                     className="!h-6"
                  />
               </div>
            </SheetHeader>

            <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
               <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full h-full flex items-center justify-center">
                  {/* 🚨 No document found */}
                  {!isDocumentValid ? (
                     <div className="text-center p-8">
                        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                           No Document Found
                        </h3>
                        <p className="text-gray-600">
                           The document information is missing or invalid. Please try again later.
                        </p>
                     </div>
                  ) : isLoading ? (
                     <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading document...</p>
                     </div>
                  ) : error ? (
                     <div className="text-center p-8">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                           Failed to Load Document
                        </h2>
                        <p className="text-gray-600">Please try again later.</p>
                     </div>
                  ) : fileUrl ? (
                     <>
                        {extension === "pdf" && (
                           <iframe
                              src={fileUrl}
                              title="PDF Preview"
                              className="w-full h-full border-0 rounded-lg"
                           />
                        )}
                        {["jpg", "jpeg", "png", "gif", "bmp"].includes(extension) && (
                           <img
                              src={fileUrl}
                              alt={fileDocument?.name}
                              className="max-h-full max-w-full object-contain rounded-lg"
                           />
                        )}
                        {extension === "txt" && (
                           <iframe
                              src={fileUrl}
                              title="Text Preview"
                              className="w-full h-full border-0 rounded-lg p-4"
                           />
                        )}
                        {["doc", "docx"].includes(extension) && (
                           <div className="text-center p-8">
                              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                 Preview Not Available
                              </h3>
                              <p className="text-gray-600 mb-4">
                                 Word documents cannot be previewed in the browser.
                              </p>
                              <Button
                                 onClick={handleDownload}
                                 className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                 <Download className="h-4 w-4" /> Download to View
                              </Button>
                           </div>
                        )}
                     </>
                  ) : (
                     <div className="text-center p-8">
                        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No File Data</h3>
                        <p className="text-gray-600">
                           The document data is not available for preview.
                        </p>
                     </div>
                  )}
               </div>
            </div>
         </SheetContent>
      </Sheet>
   );
};

export default PreviewDocumentSheet;
