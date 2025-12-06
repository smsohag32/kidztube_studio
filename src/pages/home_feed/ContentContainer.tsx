import { useGetPublicContentsQuery } from "@/redux-store/apis_action/content";
import { useState, type FC, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Heart, Share2, Loader2, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

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

interface PaginationData {
   currentPage: number;
   pageSize: number;
   totalElements: number;
   totalPages: number;
   first: boolean;
   last: boolean;
   hasNext: boolean;
   hasPrevious: boolean;
}

interface ContentResponse {
   status: string;
   message: string;
   statusCode: number;
   data: {
      content: ContentItem[];
      pagination: PaginationData;
   };
}

interface VideoCardProps {
   content: ContentItem;
   onPlay: (content: ContentItem) => void;
}

interface VideoGridProps {
   contents: ContentItem[];
   onPlay: (content: ContentItem) => void;
   isLoading: boolean;
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

// Video Card Component
const VideoCard: FC<VideoCardProps> = ({ content, onPlay }) => {
   const youtubeId = extractYouTubeId(content.url);
   const thumbnailUrl =
      content.image && content.image !== "No image available"
         ? content.image
         : youtubeId
         ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
         : null;

   const handleOpenUrl = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(content.url, "_blank");
   };

   return (
      <Card className="group overflow-hidden gap-0 cursor-pointer hover:shadow-lg transition-all duration-300  p-0 border-0">
         {/* Thumbnail Container */}
         <div className="relative overflow-hidden bg-black aspect-video">
            {thumbnailUrl ? (
               <img
                  src={thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onClick={handleOpenUrl}
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ImageOff className="w-12 h-12 text-muted-foreground/50" />
               </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
               <button
                  onClick={handleOpenUrl}
                  className="opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity duration-300 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  aria-label="Play video">
                  <Play className="w-6 h-6 text-black fill-black" />
               </button>
            </div>

            {/* Duration Badge */}
            {content.duration && (
               <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
                  {content.duration}
               </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-2 left-2">
               <Badge
                  variant="secondary"
                  className="bg-black/70 text-white hover:bg-black/80 text-xs capitalize">
                  {content.category}
               </Badge>
            </div>
         </div>

         {/* Content Info */}
         <CardContent className="p-3 space-y-2">
            {/* Title */}
            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
               {content.title}
            </h3>

            {/* Channel and Meta Info */}

            <div className="flex flex-row justify-between mt-auto gap-4">
               <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground/70">{content.addedBy}</p>
                  <p className="line-clamp-1">{formatRelativeTime(content.createdAt)}</p>
               </div>{" "}
               <div className="flex gap-2 pt-2  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="flex items-center justify-center gap-1 text-xs font-medium py-1 px-2 rounded hover:bg-muted transition-colors">
                     <Heart className="w-3 h-3" />
                  </button>
                  <button className="flex items-center justify-center gap-1 text-xs font-medium py-1 px-2 rounded hover:bg-muted transition-colors">
                     <Share2 className="w-3 h-3" />
                  </button>
               </div>
            </div>
         </CardContent>
      </Card>
   );
};

// Skeleton Loading Card
const VideoCardSkeleton: FC = () => (
   <Card className="overflow-hidden bg-background border-0">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-3 space-y-2">
         <Skeleton className="h-4 w-full" />
         <Skeleton className="h-4 w-3/4" />
         <Skeleton className="h-3 w-1/2" />
      </CardContent>
   </Card>
);

// Video Grid Component
const VideoGrid: FC<VideoGridProps> = ({ contents, onPlay, isLoading }) => {
   if (isLoading) {
      return (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {[...Array(8)].map((_, i) => (
               <VideoCardSkeleton key={i} />
            ))}
         </div>
      );
   }

   if (!contents || contents.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <ImageOff className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No content found</h3>
            <p className="text-sm text-muted-foreground/70">Check back later for new videos</p>
         </div>
      );
   }

   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
         {contents.map((content) => (
            <VideoCard
               key={content._id}
               content={content}
               onPlay={onPlay}
            />
         ))}
      </div>
   );
};

// Main Container Component
const ContentContainer: FC = () => {
   const [page, setPage] = useState<number>(0);
   const { data, isLoading, isFetching } = useGetPublicContentsQuery({
      page,
      limit: 20,
   }) as { data?: ContentResponse; isLoading: boolean; isFetching: boolean };

   const contents = useMemo(() => data?.data?.content || [], [data]);
   const pagination = useMemo(() => data?.data?.pagination, [data]);

   const handlePlayVideo = (content: ContentItem) => {
      window.open(content.url, "_blank");
   };

   const handleNextPage = () => {
      if (pagination?.hasNext) {
         setPage((prev) => prev + 1);
         window.scrollTo({ top: 0, behavior: "smooth" });
      }
   };

   const handlePrevPage = () => {
      if (pagination?.hasPrevious) {
         setPage((prev) => prev - 1);
         window.scrollTo({ top: 0, behavior: "smooth" });
      }
   };

   return (
      <div className="min-h-screen bg-background">
         {/* Main Content */}
         <div className="">
            <VideoGrid
               contents={contents}
               onPlay={handlePlayVideo}
               isLoading={isLoading || isFetching}
            />

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
               <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                     onClick={handlePrevPage}
                     disabled={!pagination.hasPrevious || isFetching}
                     variant="outline"
                     className="gap-2">
                     <ChevronLeft className="w-4 h-4" />
                     Previous
                  </Button>

                  <div className="flex items-center gap-2">
                     {[...Array(pagination.totalPages)].map((_, i) => (
                        <Button
                           key={i}
                           onClick={() => setPage(i)}
                           variant={page === i ? "default" : "outline"}
                           size="sm"
                           className="w-10">
                           {i + 1}
                        </Button>
                     ))}
                  </div>

                  <Button
                     onClick={handleNextPage}
                     disabled={!pagination.hasNext || isFetching}
                     variant="outline"
                     className="gap-2">
                     Next
                     <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            )}

            {/* Loading Indicator */}
            {isFetching && (
               <div className="flex items-center justify-center gap-2 mt-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading content...</span>
               </div>
            )}
         </div>
      </div>
   );
};

export default ContentContainer;
