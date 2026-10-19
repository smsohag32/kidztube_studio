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
      <div className="space-y-6 max-w-5xl mx-auto py-2">
         {/* Page Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
            <div className="space-y-1">
               <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Film className="h-3.5 w-3.5" />
                  <span>KidzTube Bulk Studio</span>
               </div>
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Bulk Content Upload
               </h1>
               <p className="text-xs sm:text-sm text-muted-foreground">
                  Upload multiple kids entertainment and educational videos via Excel or CSV spreadsheet.
               </p>
            </div>
            <TemplateDownload />
         </div>

         {!uploadState.isComplete ? (
            <Card className="rounded-2xl border border-border/80 shadow-sm overflow-hidden bg-card">
               <CardHeader className="pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                     <Upload className="h-4 w-4 text-primary" />
                     Spreadsheet File Upload
                  </CardTitle>
                  <CardDescription className="text-xs">
                     Ensure your spreadsheet includes required columns: <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-xs">url</code> and optional <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-xs">category</code>.
                  </CardDescription>
               </CardHeader>

               <CardContent className="space-y-4">
                  <div
                     className={cn(
                        "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300",
                        isDragOver
                           ? "border-primary bg-primary/5 scale-[1.01]"
                           : "border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-muted/10",
                        uploadState.isUploading && "pointer-events-none opacity-60"
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

                     <div className="flex flex-col items-center gap-3">
                        <div
                           className={cn(
                              "rounded-2xl p-4 transition-transform duration-300 shadow-xs",
                              isDragOver
                                 ? "bg-primary text-primary-foreground scale-110"
                                 : "bg-primary/10 text-primary"
                           )}>
                           <FileSpreadsheet className="h-8 w-8" />
                        </div>

                        <div>
                           <p className="font-bold text-base text-foreground">
                              {isDragOver ? "Drop spreadsheet here" : "Drag and drop your spreadsheet here"}
                           </p>
                           <p className="text-xs text-muted-foreground mt-1">
                              or click anywhere to browse from your computer
                           </p>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                           <Badge variant="outline" className="text-[10px] font-semibold uppercase">.XLSX</Badge>
                           <Badge variant="outline" className="text-[10px] font-semibold uppercase">.XLS</Badge>
                           <Badge variant="outline" className="text-[10px] font-semibold uppercase">.CSV</Badge>
                        </div>

                        {!uploadState.isUploading && (
                           <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl mt-2 text-xs font-semibold border-border/80">
                              Browse Files
                           </Button>
                        )}
                     </div>
                  </div>

                  {uploadState.isUploading && (
                     <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs font-medium text-foreground">
                           <span>Parsing and validating rows…</span>
                           <span>{uploadState.progress}%</span>
                        </div>
                        <Progress
                           value={uploadState.progress}
                           className="h-2 rounded-full"
                        />
                     </div>
                  )}

                  {uploadState.error && (
                     <Alert
                        variant="destructive"
                        className="rounded-xl">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{uploadState.error}</AlertDescription>
                     </Alert>
                  )}
               </CardContent>
            </Card>
         ) : (
            <>
               <Card className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-xs">
                  <CardContent className="p-4">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                           <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="h-5 w-5" />
                           </div>

                           <div>
                              <h3 className="font-bold text-sm text-foreground">File parsed successfully</h3>
                              <p className="text-xs text-muted-foreground">
                                 {fileData.name} • {(fileData.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-2">
                           <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-xs font-semibold">
                              {fileData.data.length} rows loaded
                           </Badge>
                           <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs h-8 border-border"
                              onClick={resetUpload}>
                              <X className="h-3.5 w-3.5 mr-1" /> Replace File
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
