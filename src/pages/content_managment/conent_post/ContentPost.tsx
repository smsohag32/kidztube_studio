import { useState, type FC, type ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PlusCircle, AlertCircle, CheckCircle2, Loader2, Link2 } from "lucide-react";
import { useCreateContentMutation } from "@/redux-store/apis_action/content_management";
import { displayErrors } from "@/helpers/error";

// Types
interface EmbedResult {
   type: "youtube" | "vimeo" | "video";
   id?: string;
   url?: string;
}

interface FormErrors {
   url: string;
   category: string;
}

interface PreviewData {
   url: string;
   category: string;
}

interface VideoPlayerProps {
   url: string;
   category: string;
}

interface FormFieldProps {
   label: string;
   placeholder: string;
   value: string;
   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
   error?: string;
   required?: boolean;
}

interface PreviewCardProps {
   url: string;
   category: string;
   onDismiss: () => void;
}

// Reusable Video Player Component
const VideoPlayer: FC<VideoPlayerProps> = ({ url, category }) => {
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<boolean>(false);

   const getEmbedUrl = (url: string): EmbedResult | null => {
      try {
         // YouTube
         const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/);
         if (ytMatch) return { type: "youtube", id: ytMatch[1] };

         // Vimeo
         const vmMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
         if (vmMatch) return { type: "vimeo", id: vmMatch[1] };

         // Generic video
         if (url.includes(".mp4") || url.includes(".webm")) {
            return { type: "video", url };
         }

         return null;
      } catch {
         return null;
      }
   };

   const embed = getEmbedUrl(url);

   if (!embed) {
      return (
         <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg border border-dashed border-muted-foreground/30">
            <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-sm">Preview not available for this URL</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Supported: YouTube, Vimeo, MP4</p>
         </div>
      );
   }

   return (
      <div className="relative w-full overflow-hidden rounded-lg bg-black/5 dark:bg-black/50 aspect-video">
         {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
         )}

         {embed.type === "youtube" && embed.id && (
            <iframe
               className="w-full h-full"
               src={`https://www.youtube.com/embed/${embed.id}?autoplay=0`}
               title={category}
               allowFullScreen
               onLoad={() => setIsLoading(false)}
               onError={() => {
                  setError(true);
                  setIsLoading(false);
               }}
            />
         )}

         {embed.type === "vimeo" && embed.id && (
            <iframe
               className="w-full h-full"
               src={`https://player.vimeo.com/video/${embed.id}`}
               title={category}
               allowFullScreen
               onLoad={() => setIsLoading(false)}
               onError={() => {
                  setError(true);
                  setIsLoading(false);
               }}
            />
         )}

         {embed.type === "video" && embed.url && (
            <video
               className="w-full h-full"
               controls
               onLoadedData={() => setIsLoading(false)}
               onError={() => {
                  setError(true);
                  setIsLoading(false);
               }}>
               <source src={embed.url} />
               Your browser does not support the video tag.
            </video>
         )}

         {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/70">
               <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
         )}
      </div>
   );
};

// Reusable Form Field Component
const FormField: FC<FormFieldProps> = ({
   label,
   placeholder,
   value,
   onChange,
   error,
   required = true,
}) => (
   <div className="space-y-2">
      <Label
         htmlFor={label}
         className="text-sm font-medium">
         {label}
         {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
         id={label}
         placeholder={placeholder}
         value={value}
         onChange={onChange}
         className={`bg-background border transition-colors ${
            error ? "border-destructive focus-visible:ring-destructive" : ""
         }`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
   </div>
);

// Reusable Preview Card Component
const PreviewCard: FC<PreviewCardProps> = ({ url, category, onDismiss }) => (
   <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
      <CardHeader className="pb-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <CheckCircle2 className="w-5 h-5 text-primary" />
               <CardTitle className="text-lg">Preview</CardTitle>
            </div>
            <button
               onClick={onDismiss}
               className="text-muted-foreground hover:text-foreground transition-colors"
               aria-label="Close preview">
               ✕
            </button>
         </div>
         <CardDescription>Your content is ready to be shared</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  URL
               </p>
               <div className="flex items-start gap-2">
                  <Link2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium break-all text-primary line-clamp-2">{url}</p>
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Category
               </p>
               <div className="inline-block px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20">
                  <p className="text-sm font-medium text-primary">{category}</p>
               </div>
            </div>
         </div>
         <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
               Preview
            </p>
            <VideoPlayer
               url={url}
               category={category}
            />
         </div>
      </CardContent>
   </Card>
);

// Main Content Post Component
const ContentPost: FC = () => {
   const [contentUrl, setContentUrl] = useState<string>("");
   const [category, setCategory] = useState<string>("");
   const [preview, setPreview] = useState<PreviewData | null>(null);
   const [errors, setErrors] = useState<FormErrors>({ url: "", category: "" });
   const [createContent, { isLoading: loading }] = useCreateContentMutation();
   const validateInputs = (): boolean => {
      const newErrors: FormErrors = { url: "", category: "" };

      if (!contentUrl.trim()) {
         newErrors.url = "Content URL is required";
      } else if (!contentUrl.match(/^https?:\/\//)) {
         newErrors.url = "Please enter a valid URL starting with http:// or https://";
      }

      if (!category.trim()) {
         newErrors.category = "Category is required";
      } else if (category.length < 2) {
         newErrors.category = "Category must be at least 2 characters";
      }

      setErrors(newErrors);
      return !newErrors.url && !newErrors.category;
   };

   const handleSubmit = async (): Promise<void> => {
      if (!validateInputs()) return;

      try {
         const response = await createContent({
            url: contentUrl,
            category,
         }).unwrap();

         toast.success("Content posted successfully!", {
            description: "Your content is now live and visible to others.",
         });

         if (response?.data) {
            setPreview(response.data as any);
            setContentUrl("");
            setCategory("");
            setErrors({ url: "", category: "" });
         } else {
            toast.error("Unexpected response from server.", {
               description: "Please try again later.",
            });
         }
      } catch (err) {
         displayErrors(err);
      }
   };

   const handleClear = (): void => {
      setContentUrl("");
      setCategory("");
      setErrors({ url: "", category: "" });
   };

   const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
      setContentUrl(e.target.value);
      if (errors.url) setErrors({ ...errors, url: "" });
   };

   const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>): void => {
      setCategory(e.target.value);
      if (errors.category) setErrors({ ...errors, category: "" });
   };

   return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
         <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            <div className="space-y-8">
               {/* Header Section */}
               <div className="space-y-2 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                     <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                        <PlusCircle className="w-6 h-6 text-primary" />
                     </div>
                     <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Post New Content
                     </h1>
                  </div>
                  <p className="text-base text-muted-foreground md:ml-11">
                     Share your videos and content with the community. Add a URL and category to get
                     started.
                  </p>
               </div>

               {/* Form Card */}
               <Card className="border shadow-lg">
                  <CardHeader>
                     <CardTitle className="text-xl">Content Details</CardTitle>
                     <CardDescription>
                        Fill in the information below to post your content
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField
                              label="Content URL"
                              placeholder="https://youtube.com/watch?v=..."
                              value={contentUrl}
                              onChange={handleUrlChange}
                              error={errors.url}
                           />

                           <FormField
                              label="Category"
                              placeholder="e.g., Education, Music, News, Tech..."
                              value={category}
                              onChange={handleCategoryChange}
                              error={errors.category}
                           />
                        </div>

                        <div className="flex gap-3 pt-2">
                           <Button
                              onClick={handleSubmit}
                              disabled={loading}
                              className="flex-1 md:flex-none px-8 h-11 gap-2">
                              {loading ? (
                                 <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Posting...
                                 </>
                              ) : (
                                 <>
                                    <PlusCircle className="w-4 h-4" />
                                    Post Content
                                 </>
                              )}
                           </Button>
                           <Button
                              variant="outline"
                              onClick={handleClear}
                              disabled={loading}
                              className="px-8 h-11">
                              Clear
                           </Button>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Preview Section */}
               {preview && (
                  <PreviewCard
                     url={preview.url}
                     category={preview.category}
                     onDismiss={() => setPreview(null)}
                  />
               )}
            </div>
         </div>
      </div>
   );
};

export default ContentPost;
