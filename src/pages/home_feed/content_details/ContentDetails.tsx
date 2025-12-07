import { useState, type FC, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
   MoreVertical,
   Bell,
   Play,
   AlertCircle,
   CheckCircle2,
} from "lucide-react";

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

   if (diffMinutes < 1) return "now";
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
         <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
         </div>
      );
   }

   return (
      <div className="w-full select-none aspect-video rounded-lg overflow-hidden bg-black">
         <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title="Video player"
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
   const [disliked, setDisliked] = useState(false);

   const handleLike = () => {
      setLiked(!liked);
      if (disliked) setDisliked(false);
   };

   const handleDislike = () => {
      setDisliked(!disliked);
      if (liked) setLiked(false);
   };

   return (
      <div className="space-y-4">
         {/* Title */}
         <div className="space-y-3">
            <h1 className="text-xl font-bold leading-tight">{content.title}</h1>

            {/* Meta Info and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               {/* Channel Info */}
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-semibold text-sm">
                     {content.addedBy.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                     <p className="font-semibold text-sm">{content.addedBy}</p>
                     <p className="text-xs text-muted-foreground">
                        @{content.addedBy.toLowerCase().replace(/\s+/g, "")}
                     </p>
                  </div>
                  <Button
                     onClick={() => setIsSubscribed(!isSubscribed)}
                     variant={isSubscribed ? "outline" : "default"}
                     size="sm"
                     className="ml-2 gap-1">
                     <Bell className="w-4 h-4" />
                     <span className="hidden sm:inline">
                        {isSubscribed ? "Subscribed" : "Subscribe"}
                     </span>
                  </Button>
               </div>

               {/* Action Buttons */}
               <div className="flex items-center gap-2">
                  <div className="flex items-center bg-muted rounded-full p-1">
                     <Button
                        onClick={handleLike}
                        variant="ghost"
                        size="sm"
                        className={`gap-1 h-8 ${liked ? "text-primary" : ""}`}>
                        <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                        <span className="text-xs hidden sm:inline">Like</span>
                     </Button>
                     <div className="w-px h-6 bg-border" />
                     <Button
                        onClick={handleDislike}
                        variant="ghost"
                        size="sm"
                        className={`gap-1 h-8 ${disliked ? "text-primary" : ""}`}>
                        <ThumbsDown className={`w-4 h-4 ${disliked ? "fill-current" : ""}`} />
                     </Button>
                  </div>

                  <Button
                     onClick={onShare}
                     variant="ghost"
                     size="sm"
                     className="gap-1 text-muted-foreground hover:text-foreground h-8">
                     <Share2 className="w-4 h-4" />
                     <span className="hidden sm:inline text-xs">Share</span>
                  </Button>

                  <Button
                     variant="ghost"
                     size="sm"
                     className="text-muted-foreground hover:text-foreground h-8">
                     <MoreVertical className="w-4 h-4" />
                  </Button>
               </div>
            </div>
         </div>

         {/* Description Section */}
         <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-semibold">
                     {formatRelativeTime(content.createdAt)}
                  </span>
                  <Badge
                     variant="secondary"
                     className="text-xs capitalize">
                     {content.category}
                  </Badge>
               </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{content.description}</p>
            <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
               Show more
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
         className="flex gap-2 cursor-pointer group hover:opacity-80 transition-opacity">
         {/* Thumbnail */}
         <div className="relative flex-shrink-0 w-24 aspect-video rounded overflow-hidden bg-black">
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
         </div>

         {/* Info */}
         <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">
               {content.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{content.addedBy}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(content.createdAt)}</p>
         </div>

         {/* More Options */}
         <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-6 w-6 p-0"
            onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="w-3 h-3" />
         </Button>
      </div>
   );
};

// Loading Skeleton
const ContentDetailsSkeleton: FC = () => (
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
         <Skeleton className="aspect-video w-full rounded-lg" />
         <Skeleton className="h-6 w-3/4" />
         <Skeleton className="h-4 w-1/2" />
         <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-4">
         {[...Array(6)].map((_, i) => (
            <div
               key={i}
               className="flex gap-2">
               <Skeleton className="flex-shrink-0 w-24 aspect-video rounded" />
               <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-2/3" />
                  <Skeleton className="h-2 w-1/2" />
               </div>
            </div>
         ))}
      </div>
   </div>
);

// Main Component
const ContentDetails: FC = () => {
   const [searchParams, setSearchParams] = useSearchParams();
   const contentId = searchParams.get("id");
   const [copied, setCopied] = useState(false);

   const { data: contentData, isLoading } = useGetPublicContentByIdQuery(contentId, {
      skip: !contentId,
   }) as { data?: ContentDetailsResponse; isLoading: boolean };

   const { data: recommendedData } = useGetPublicContentsQuery({ page: 0, limit: 10 }) as {
      data?: ContentListResponse;
   };

   const content: any = useMemo(() => contentData, [contentData]);
   const recommendedVideos = useMemo(
      () => recommendedData?.data?.content?.filter((c) => c._id !== contentId) || [],
      [recommendedData, contentId]
   );

   const handleShare = () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}?id=${contentId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const handleVideoClick = (id: string) => {
      setSearchParams({ id });
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   if (isLoading) {
      return (
         <div className="min-h-screen bg-background">
            <div className="">
               <ContentDetailsSkeleton />
            </div>
         </div>
      );
   }

   if (!content) {
      return (
         <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-3">
               <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
               <h2 className="text-lg font-semibold">Content not found</h2>
               <p className="text-sm text-muted-foreground">Please select a video to watch</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-background">
         <div className="">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Main Content - Left Side */}
               <div className="lg:col-span-2 space-y-4">
                  {/* Video Player */}
                  <VideoPlayer url={content.url} />

                  {/* Video Info */}
                  <VideoInfo
                     content={content}
                     onShare={handleShare}
                  />

                  {/* Share Confirmation */}
                  {copied && (
                     <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-800 dark:text-green-300">
                           Link copied to clipboard
                        </span>
                     </div>
                  )}
               </div>

               {/* Recommended Videos - Right Side */}
               <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Recommended</h3>
                  <div className="space-y-3 ">
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
                           No recommendations available
                        </p>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ContentDetails;
