import { useState, type FC, type ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
   PlusCircle,
   AlertCircle,
   CheckCircle2,
   Loader2,
   Link2,
   Sparkles,
   ShieldCheck,
   Lightbulb,
   Video,
   ArrowRight,
} from "lucide-react";
import { useCreateContentMutation } from "@/redux-store/apis_action/content_management";
import { displayErrors } from "@/helpers/error";
import { Link } from "react-router-dom";

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
         <div className="flex flex-col items-center justify-center h-52 bg-muted/40 rounded-xl border border-dashed border-border text-center p-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground/60 mb-2" />
            <p className="text-muted-foreground text-xs font-medium">Preview not available for this link</p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">Supports YouTube, Vimeo, MP4 URLs</p>
         </div>
      );
   }

   return (
      <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video shadow-md ring-1 ring-border/80">
         {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/60 backdrop-blur-xs z-10">
               <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
         )}

         {embed.type === "youtube" && embed.id && (
            <iframe
               className="w-full h-full"
               src={`https://www.youtube.com/embed/${embed.id}?autoplay=0&rel=0`}
               title={category || "Video preview"}
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
               title={category || "Video preview"}
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
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
               <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
         )}
      </div>
   );
};

// Main Content Post Component
const ContentPost: FC = () => {
   const [contentUrl, setContentUrl] = useState<string>("");
   const [category, setCategory] = useState<string>("");
   const [preview, setPreview] = useState<PreviewData | null>(null);
   const [errors, setErrors] = useState<FormErrors>({ url: "", category: "" });
   const [createContent, { isLoading: loading }] = useCreateContentMutation();

   const popularCategories = [
      "Cartoons",
      "Learning",
      "Nursery Rhymes",
      "Stories",
      "Science",
      "Crafts & DIY",
      "Music",
   ];

   const validateInputs = (): boolean => {
      const newErrors: FormErrors = { url: "", category: "" };

      if (!contentUrl.trim()) {
         newErrors.url = "Content URL is required";
      } else if (!contentUrl.match(/^https?:\/\//)) {
         newErrors.url = "Please enter a valid URL starting with https://";
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

         toast.success("Content published successfully!", {
            description: "Your video is now added to the studio catalog.",
         });

         if (response?.data) {
            setPreview(response.data as any);
            setContentUrl("");
            setCategory("");
            setErrors({ url: "", category: "" });
         }
      } catch (err) {
         displayErrors(err);
      }
   };

   const handleClear = (): void => {
      setContentUrl("");
      setCategory("");
      setErrors({ url: "", category: "" });
      setPreview(null);
   };

   const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
      setContentUrl(e.target.value);
      if (errors.url) setErrors({ ...errors, url: "" });
   };

   const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>): void => {
      setCategory(e.target.value);
      if (errors.category) setErrors({ ...errors, category: "" });
   };

   const isYouTubeUrl = contentUrl.includes("youtube.com") || contentUrl.includes("youtu.be");

   return (
      <div className="space-y-6 max-w-5xl mx-auto py-2">
         {/* Page Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
            <div className="space-y-1">
               <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Creator Studio</span>
               </div>
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Publish New Video
               </h1>
               <p className="text-xs sm:text-sm text-muted-foreground">
                  Add safe, high quality educational or entertainment videos to KidzTube.
               </p>
            </div>

            <Link
               to="/content-management/content-bulk-upload"
               className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border/80 bg-background hover:bg-muted transition-colors self-start sm:self-auto">
               <span>Bulk Upload Excel</span>
               <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
         </div>

         {/* 2-Column Layout: Form & Live Preview / Guidelines */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-5">
               <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 space-y-6">
                  <div className="space-y-1">
                     <CardTitle className="text-base font-bold text-foreground">Video Source & Meta</CardTitle>
                     <CardDescription className="text-xs">
                        Enter video link and choose a kids learning or entertainment category.
                     </CardDescription>
                  </div>

                  {/* Video URL Input */}
                  <div className="space-y-2">
                     <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>Video URL <span className="text-destructive">*</span></span>
                        <span className="text-[11px] font-normal text-muted-foreground">YouTube, Vimeo, MP4</span>
                     </Label>
                     <div className="relative">
                        <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                           placeholder="https://www.youtube.com/watch?v=..."
                           value={contentUrl}
                           onChange={handleUrlChange}
                           className={`pl-10 text-xs sm:text-sm rounded-xl h-11 ${
                              errors.url ? "border-destructive ring-1 ring-destructive" : ""
                           }`}
                        />
                     </div>
                     {errors.url && <p className="text-xs text-destructive mt-1">{errors.url}</p>}
                  </div>

                  {/* Category Input & Quick Chips */}
                  <div className="space-y-2.5">
                     <Label className="text-xs font-bold text-foreground">
                        Category <span className="text-destructive">*</span>
                     </Label>
                     <Input
                        placeholder="e.g. Cartoons, Learning, Rhymes..."
                        value={category}
                        onChange={handleCategoryChange}
                        className={`text-xs sm:text-sm rounded-xl h-11 ${
                           errors.category ? "border-destructive ring-1 ring-destructive" : ""
                        }`}
                     />
                     {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}

                     {/* Quick Category Chips */}
                     <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-muted-foreground">Quick select:</span>
                        <div className="flex flex-wrap gap-1.5">
                           {popularCategories.map((cat) => (
                              <button
                                 key={cat}
                                 type="button"
                                 onClick={() => {
                                    setCategory(cat);
                                    if (errors.category) setErrors({ ...errors, category: "" });
                                 }}
                                 className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                    category === cat
                                       ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                       : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                                 }`}>
                                 {cat}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                     <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-xl px-6 h-11 text-xs font-semibold gap-2 shadow-sm">
                        {loading ? (
                           <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Publishing...</span>
                           </>
                        ) : (
                           <>
                              <PlusCircle className="w-4 h-4" />
                              <span>Publish Video</span>
                           </>
                        )}
                     </Button>
                     <Button
                        variant="outline"
                        onClick={handleClear}
                        disabled={loading}
                        className="rounded-xl px-5 h-11 text-xs font-semibold border-border/80">
                        Reset
                     </Button>
                  </div>
               </Card>

               {/* Success card if newly posted */}
               {preview && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                     <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                     <div className="space-y-1 text-xs">
                        <p className="font-bold text-sm">Video published!</p>
                        <p>Your video was added successfully. You can view it in the home feed or manage it in content management.</p>
                     </div>
                  </div>
               )}
            </div>

            {/* Preview & Guidelines Column */}
            <div className="lg:col-span-5 space-y-5">
               {/* Live URL Video Preview Card */}
               <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <Video className="w-3.5 h-3.5 text-primary" />
                        Live Player Preview
                     </h3>
                     {isYouTubeUrl && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                           YouTube Link Detected
                        </span>
                     )}
                  </div>

                  {contentUrl ? (
                     <VideoPlayer
                        url={contentUrl}
                        category={category}
                     />
                  ) : (
                     <div className="aspect-video rounded-xl bg-muted/30 border border-dashed border-border/80 flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                        <Video className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-xs font-medium">Paste a video URL above</p>
                        <p className="text-[11px] text-muted-foreground/70">A live video preview will appear here immediately</p>
                     </div>
                  )}
               </Card>

               {/* Kid-Safe Guidelines Card */}
               <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-sky-500/5 to-transparent p-5 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide">
                     <ShieldCheck className="w-4 h-4" />
                     KidzTube Safety Checklist
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                     <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Ensure content is suitable for toddlers, kids, or teenagers.</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>No explicit language, graphic imagery, or dangerous stunts.</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>High educational, creative, or musical value encouraged.</span>
                     </li>
                  </ul>
               </Card>
            </div>
         </div>
      </div>
   );
};

export default ContentPost;

