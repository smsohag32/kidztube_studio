import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { HotTable } from "@handsontable/react";
import { toast } from "sonner";
import { useBulkUploadContentMutation } from "@/redux-store/apis_action/content_management";
import { displayErrors } from "@/helpers/error";
import TemplateDownload from "./TemplateDownload";

const UploadContent = () => {
   const [uploadState, setUploadState] = useState({
      isUploading: false,
      isComplete: false,
      progress: 0,
      error: null as string | null,
   });

   const [bulkUploadContent, { isLoading }] = useBulkUploadContentMutation();

   const [fileData, setFileData] = useState<any>(null);
   const [isDragOver, setIsDragOver] = useState(false);
   const fileInputRef = useRef<HTMLInputElement | null>(null);
   const [file, setFile] = useState<File | null>(null);

   const resetUpload = () => {
      setUploadState({ isUploading: false, isComplete: false, progress: 0, error: null });
      setFileData(null);
      setFile(null);
   };

   const validateFile = (file: File) => {
      const allowed = [".xlsx", ".xls", ".csv"];
      return allowed.some((ext) => file.name.toLowerCase().endsWith(ext));
   };

   const parseFile = (file: File) =>
      new Promise((resolve, reject) => {
         const reader = new FileReader();

         reader.onload = (e: any) => {
            try {
               const data = e.target.result;
               const workbook = XLSX.read(data, { type: "binary" });

               const sheet = workbook.SheetNames[0];
               const worksheet = workbook.Sheets[sheet];
               const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

               const headers = jsonData[0] || [];
               const rows = jsonData.slice(1);

               resolve({ name: file.name, size: file.size, headers, data: rows });
            } catch {
               reject(new Error("Invalid Excel/CSV file"));
            }
         };

         reader.onerror = () => reject(new Error("Failed to read file"));
         reader.readAsBinaryString(file);
      });

   const simulateUpload = async (file: File) => {
      setUploadState({ isUploading: true, isComplete: false, progress: 0, error: null });

      try {
         for (let i = 0; i <= 100; i += 15) {
            setUploadState((p) => ({ ...p, progress: i }));
            await new Promise((r) => setTimeout(r, 70));
         }

         const parsed = (await parseFile(file)) as any;
         setFileData(parsed);

         setUploadState({ isUploading: false, isComplete: true, progress: 100, error: null });
      } catch (err: any) {
         setUploadState({
            isUploading: false,
            isComplete: false,
            progress: 0,
            error: err.message,
         });
      }
   };

   const handleFileSelect = async (files: FileList | null) => {
      if (!files?.length) return;
      const selectedFile = files[0];

      if (!validateFile(selectedFile)) {
         setUploadState((p) => ({ ...p, error: "Invalid file type" }));
         return;
      }

      if (selectedFile.size > 20 * 1024 * 1024) {
         setUploadState((p) => ({ ...p, error: "Max file size 20MB" }));
         return;
      }

      setFile(selectedFile);
      await simulateUpload(selectedFile);
   };

   const handleUpload = async () => {
      if (!file) return;
      try {
         const formData = new FormData();
         formData.append("excel", file);
         formData.append("addedBy", "KidzTube Admin");

         await bulkUploadContent(formData).unwrap();

         toast.success("Content uploaded successfully!");
         resetUpload();
      } catch (err) {
         displayErrors(err);
      }
   };

   return (
      <div className="w-full px-4 py-5">
         <div className="mb-4 flex items-end justify-between w-full">
            <div className="w-full">
               <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-1 rounded-full text-xs text-primary">
                  <Film className="h-3 w-3" />
                  KidzTube Bulk Upload
               </div>

               <h1 className="text-xl font-bold mt-2">Upload Kids Video Content</h1>
               <p className="text-muted-foreground max-w-2xl">
                  Upload kids entertainment YouTube video URLs with optional categories.
               </p>
            </div>
            <TemplateDownload />
         </div>

         <Separator className="mb-6" />

         {!uploadState.isComplete ? (
            <Card>
               <CardHeader>
                  <div className="flex items-end justify-between">
                     <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                           <Upload className="h-5 w-5" />
                           Upload Content Excel
                        </CardTitle>
                        <CardDescription>Upload Excel with columns: url, category</CardDescription>
                     </div>
                  </div>
               </CardHeader>

               <CardContent>
                  <div
                     className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
                        isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30",
                        uploadState.isUploading && "pointer-events-none opacity-50"
                     )}
                     onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        handleFileSelect(e.dataTransfer.files);
                     }}
                     onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                     }}
                     onDragLeave={() => setIsDragOver(false)}
                     onClick={() => fileInputRef.current?.click()}>
                     <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        ref={fileInputRef}
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                     />

                     <div className="flex flex-col items-center gap-4">
                        <div
                           className={cn(
                              "rounded-full p-4",
                              isDragOver ? "bg-primary text-white" : "bg-muted"
                           )}>
                           <FileSpreadsheet className="h-8 w-8" />
                        </div>

                        <p className="font-medium text-lg">
                           {isDragOver ? "Drop file here" : "Drop file here or click to browse"}
                        </p>
                        <p className="text-muted-foreground text-sm">Supports .xlsx .xls .csv</p>

                        {!uploadState.isUploading && (
                           <Button
                              variant="outline"
                              className="bg-transparent mt-2">
                              Browse Files
                           </Button>
                        )}
                     </div>
                  </div>

                  {uploadState.isUploading && (
                     <div className="mt-6">
                        <div className="flex justify-between text-sm mb-1">
                           <span>Processing file…</span>
                           <span>{uploadState.progress}%</span>
                        </div>
                        <Progress
                           value={uploadState.progress}
                           className="h-2"
                        />
                     </div>
                  )}

                  {uploadState.error && (
                     <Alert
                        variant="destructive"
                        className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{uploadState.error}</AlertDescription>
                     </Alert>
                  )}
               </CardContent>
            </Card>
         ) : (
            <>
               <Card>
                  <CardContent>
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="bg-green-100 p-2 rounded-full">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                           </div>

                           <div>
                              <h3 className="font-semibold">File parsed successfully</h3>
                              <p className="text-sm text-muted-foreground">
                                 {fileData.name} • {(fileData.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                           </div>
                        </div>

                        <div className="flex gap-2">
                           <Badge variant="secondary">{fileData.data.length} rows</Badge>
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={resetUpload}>
                              <X className="h-4 w-4 mr-1" /> Start Over
                           </Button>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="mt-6">
                  <CardHeader className="flex justify-between flex-col lg:flex-row">
                     <div>
                        <CardTitle>Content Data Preview</CardTitle>
                        <CardDescription>
                           Review YouTube URLs and categories before upload.
                        </CardDescription>
                     </div>

                     <Button
                        disabled={isLoading}
                        onClick={handleUpload}
                        className="mt-4 lg:mt-0">
                        {isLoading ? "Uploading..." : "Submit Content"}
                     </Button>
                  </CardHeader>

                  <CardContent>
                     <HotTable
                        data={fileData.data}
                        colHeaders={fileData.headers}
                        rowHeaders={true}
                        height="500"
                        width="100%"
                        colWidths={250}
                        licenseKey="non-commercial-and-evaluation"
                        settings={{ readOnly: false, stretchH: "all", manualColumnResize: true }}
                     />

                     <div className="flex justify-between text-sm text-muted-foreground mt-4">
                        <span>
                           Showing {fileData.data.length} rows × {fileData.headers.length} columns
                        </span>
                     </div>
                  </CardContent>
               </Card>
            </>
         )}
      </div>
   );
};

export default UploadContent;
