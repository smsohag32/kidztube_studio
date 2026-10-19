import { useState, type FC, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
   useGetPublicContentByIdQuery,
   useGetPublicContentsQuery,
} from "@/redux-store/apis_action/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
   ThumbsUp,
   ThumbsDown,
   Share2,
   Bell,
   Play,
   AlertCircle,
   CheckCircle2,
   ArrowLeft,
   Sparkles,
   Bookmark,
   Check,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface ContentItem {
   _id: string;
   title: string;
   url: string;
   description: string;
   image: string;
   category: string;
   isApproved: boolean;
   addedBy: string;
   status: boolean;
   duration: string;
   tags: string[];
   createdAt: string;
}

interface ContentDetailsResponse {
   status: string;
   message: string;
   statusCode: number;
   data: ContentItem;
}

interface ContentListResponse {
   status: string;
   message: string;
   statusCode: number;
   data: {
      content: ContentItem[];
      pagination: {
         currentPage: number;
         pageSize: number;
         totalElements: number;
         totalPages: number;
         hasNext: boolean;
         hasPrevious: boolean;
      };
   };
}

// Extract YouTube video ID
const extractYouTubeId = (url: string): string | null => {
   try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
   } catch {
      return null;
   }
};

// Format date to relative time
const formatRelativeTime = (date: string): string => {
   const now = new Date();
   const createdDate = new Date(date);
   const diffMs = now.getTime() - createdDate.getTime();
   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
   const diffMinutes = Math.floor(diffMs / (1000 * 60));

   if (diffMinutes < 1) return "just now";
   if (diffMinutes < 60) return `${diffMinutes}m ago`;
   if (diffHours < 24) return `${diffHours}h ago`;
   if (diffDays < 7) return `${diffDays}d ago`;
   if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
   return `${Math.floor(diffDays / 30)}mo ago`;
};

// Video Player Component
const VideoPlayer: FC<{ url: string }> = ({ url }) => {
   const youtubeId = extractYouTubeId(url);

   if (!youtubeId) {
      return (
         <div className="w-full aspect-video bg-black/90 rounded-2xl flex flex-col items-center justify-center border border-border/80 text-muted-foreground">
            <AlertCircle className="w-12 h-12 text-destructive mb-2" />
            <p className="text-sm font-semibold">Video preview unavailable</p>
         </div>
      );
   }

   return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-border/80">
         <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title="KidzTube Player"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
         />
      </div>
   );
};

// Video Info Component
const VideoInfo: FC<{ content: ContentItem; onShare: () => void }> = ({ content, onShare }) => {
   const [isSubscribed, setIsSubscribed] = useState(false);
   const [liked, setLiked] = useState(false);
   const [likeCount, setLikeCount] = useState(142);
   const [disliked, setDisliked] = useState(false);
   const [isSaved, setIsSaved] = useState(false);
   const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

   const handleLike = () => {
      if (liked) {
         setLiked(false);
         setLikeCount((c) => c - 1);
      } else {
         setLiked(true);
         setLikeCount((c) => c + 1);
         if (disliked) setDisliked(false);
         toast.success("Liked this video!");
      }
   };

   const handleDislike = () => {
      setDisliked(!disliked);
      if (liked) {
         setLiked(false);
         setLikeCount((c) => c - 1);
      }
   };

   const handleSubscribe = () => {
      setIsSubscribed((prev) => {
         const next = !prev;
         if (next) {
            toast.success(`Subscribed to ${content.addedBy}!`);
         } else {
            toast.info(`Unsubscribed from ${content.addedBy}`);
         }
         return next;
      });
   };

   const handleSave = () => {
      setIsSaved((prev) => {
         const next = !prev;
         if (next) {
            toast.success("Saved to watch later!");
         }
         return next;
      });
   };

   const initials = (content.addedBy || "KT")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

   return (
      <div className="space-y-4 pt-1">
         {/* Title & Category Badge */}
         <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
               <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
                  {content.category}
               </Badge>
               <span className="text-xs text-muted-foreground">
                  Published {formatRelativeTime(content.createdAt)}
               </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
               {content.title}
            </h1>
         </div>

         {/* Creator and Action Bar */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 border-y border-border/40">
            {/* Channel Info */}
            <div className="flex items-center gap-3">
               <div className="size-11 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-sky-400 text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-background">
                  {initials}
               </div>
               <div>
                  <div className="flex items-center gap-1.5">
                     <p className="font-bold text-sm text-foreground">{content.addedBy}</p>
                     <span className="p-0.5 rounded-full bg-sky-500/15 text-sky-500" title="Verified Creator">
                        <Check className="w-3 h-3 stroke-[3]" />
                     </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Verified Kids Creator</p>
               </div>
               <Button
                  onClick={handleSubscribe}
                  variant={isSubscribed ? "outline" : "default"}
                  size="sm"
                  className={`ml-3 rounded-full text-xs font-semibold px-4 transition-all ${
                     isSubscribed
                        ? "border-border text-foreground hover:bg-muted"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  }`}>
                  <Bell className={`w-3.5 h-3.5 mr-1.5 ${isSubscribed ? "fill-current" : ""}`} />
                  {isSubscribed ? "Subscribed" : "Subscribe"}
               </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
               {/* Like / Dislike Pill */}
               <div className="inline-flex items-center rounded-full bg-muted/70 p-0.5 border border-border/60">
                  <button
                     onClick={handleLike}
                     className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        liked ? "text-primary bg-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                     }`}>
                     <ThumbsUp className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
                     <span>{likeCount}</span>
                  </button>
                  <div className="w-px h-4 bg-border/80 mx-0.5" />
                  <button
                     onClick={handleDislike}
                     aria-label="Dislike"
                     className={`p-1.5 rounded-full text-xs transition-all ${
                        disliked ? "text-primary bg-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                     }`}>
                     <ThumbsDown className={`w-3.5 h-3.5 ${disliked ? "fill-current" : ""}`} />
                  </button>
               </div>

               {/* Share Button */}
               <Button
                  onClick={onShare}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-semibold gap-1.5 border-border/60 hover:bg-muted">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
               </Button>

               {/* Save Button */}
               <Button
                  onClick={handleSave}
                  variant="outline"
                  size="sm"
                  className={`rounded-full text-xs font-semibold gap-1.5 border-border/60 hover:bg-muted ${
                     isSaved ? "text-primary border-primary/40" : ""
                  }`}>
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save"}</span>
               </Button>
            </div>
         </div>

         {/* Description Section */}
         <div className="rounded-2xl bg-muted/40 border border-border/60 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
               <span>Safe Kids Certified Content</span>
               <span className="flex items-center gap-1 text-primary">
                  <Sparkles className="w-3.5 h-3.5" /> Family Friendly
               </span>
            </div>
            <p className={`text-sm text-foreground/85 leading-relaxed whitespace-pre-line ${
               !isDescriptionOpen ? "line-clamp-2" : ""
            }`}>
               {content.description || "No description provided for this video."}
            </p>

            {content.tags && content.tags.length > 0 && (
               <div className="flex flex-wrap gap-1.5 pt-1">
                  {content.tags.map((tag, idx) => (
                     <span
                        key={idx}
                        className="text-[11px] font-medium text-primary hover:underline cursor-pointer">
                        #{tag}
                     </span>
                  ))}
               </div>
            )}

            <button
               onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
               className="text-xs font-semibold text-primary hover:underline transition-colors block pt-1">
               {isDescriptionOpen ? "Show less" : "Show more"}
            </button>
         </div>
      </div>
   );
};

// Recommended Video Card Component
const RecommendedVideoCard: FC<{ content: ContentItem; onClick: (id: string) => void }> = ({
   content,
   onClick,
}) => {
   const youtubeId = extractYouTubeId(content.url);
   const thumbnailUrl =
      content.image && content.image !== "No image available"
         ? content.image
         : youtubeId
         ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
         : "";

   return (
      <div
         onClick={() => onClick(content._id)}
         className="flex gap-3 cursor-pointer group p-2 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/60 transition-all duration-200">
         {/* Thumbnail */}
         <div className="relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden bg-black/90">
            {thumbnailUrl ? (
               <img
                  src={thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
               />
            ) : (
               <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="w-4 h-4 text-muted-foreground/50" />
               </div>
            )}

            {content.duration && (
               <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.2 rounded">
                  {content.duration}
               </div>
            )}
         </div>

         {/* Info */}
         <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-xs font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
               {content.title}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{content.addedBy}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
               <span className="capitalize">{content.category}</span>
               <span>•</span>
               <span>{formatRelativeTime(content.createdAt)}</span>
            </div>
         </div>
      </div>
   );
};

// Loading Skeleton
const ContentDetailsSkeleton: FC = () => (
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
         <Skeleton className="aspect-video w-full rounded-2xl" />
         <Skeleton className="h-7 w-3/4 rounded-lg" />
         <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-3">
               <Skeleton className="size-10 rounded-full" />
               <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
               </div>
            </div>
            <Skeleton className="h-9 w-32 rounded-full" />
         </div>
         <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
      <div className="space-y-3">
         <Skeleton className="h-5 w-32" />
         {[...Array(5)].map((_, i) => (
            <div
               key={i}
               className="flex gap-3">
               <Skeleton className="w-32 aspect-video rounded-lg flex-shrink-0" />
               <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2.5 w-1/2" />
               </div>
            </div>
         ))}
      </div>
   </div>
);

// Main Component
const ContentDetails: FC = () => {
   const [searchParams, setSearchParams] = useSearchParams();
   const navigate = useNavigate();
   const contentId = searchParams.get("id");

   const { data: contentData, isLoading } = useGetPublicContentByIdQuery(contentId, {
      skip: !contentId,
   }) as { data?: ContentDetailsResponse; isLoading: boolean };

   const { data: recommendedData } = useGetPublicContentsQuery({ page: 0, limit: 10 }) as {
      data?: ContentListResponse;
   };

   const content: any = useMemo(() => contentData?.data, [contentData]);
   const recommendedVideos = useMemo(
      () => recommendedData?.data?.content?.filter((c) => c._id !== contentId) || [],
      [recommendedData, contentId]
   );

   const handleShare = async () => {
      const shareUrl = `${window.location.origin}/content?id=${contentId}`;
      try {
         await navigator.clipboard.writeText(shareUrl);
         toast.success("Link copied to clipboard!");
      } catch {
         toast.info("Share URL: " + shareUrl);
      }
   };

   const handleVideoClick = (id: string) => {
      setSearchParams({ id });
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   if (isLoading) {
      return (
         <div className="min-h-screen bg-background">
            <ContentDetailsSkeleton />
         </div>
      );
   }

   if (!content) {
      return (
         <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-border/80 bg-muted/10">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
               <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Video Not Found</h2>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
               This video could not be loaded or may have been removed.
            </p>
            <Button
               onClick={() => navigate("/")}
               className="rounded-xl gap-2 font-semibold shadow-sm">
               <ArrowLeft className="w-4 h-4" />
               Back to Home Feed
            </Button>
         </div>
      );
   }

   return (
      <div className="min-h-screen space-y-4">
         {/* Top Navigation Bar */}
         <div className="flex items-center justify-between">
            <Link
               to="/"
               className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3 py-1.5 rounded-xl border border-border/60 transition-colors">
               <ArrowLeft className="w-3.5 h-3.5" />
               <span>Back to Feed</span>
            </Link>

            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
               <Sparkles className="w-3.5 h-3.5 text-primary" />
               KidzTube Cinema
            </span>
         </div>

         {/* Grid Layout: Video + Recommendations */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-4">
               <VideoPlayer url={content.url} />
               <VideoInfo
                  content={content}
                  onShare={handleShare}
               />
            </div>

            {/* Recommended Videos - Right Side */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                     <span>Up Next</span>
                     <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        {recommendedVideos.length}
                     </span>
                  </h3>
               </div>

               <div className="space-y-2">
                  {recommendedVideos.length > 0 ? (
                     recommendedVideos.map((video) => (
                        <RecommendedVideoCard
                           key={video._id}
                           content={video}
                           onClick={handleVideoClick}
                        />
                     ))
                  ) : (
                     <p className="text-xs text-muted-foreground text-center py-8">
                        No additional recommendations
                     </p>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ContentDetails;

