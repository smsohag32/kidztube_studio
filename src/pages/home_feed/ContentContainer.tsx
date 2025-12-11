import { useGetPublicContentsQuery } from "@/redux-store/apis_action/content";
import { useState, type FC, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Heart, Share2, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/redux-store";
import { useSelector } from "react-redux";

// Constants
const BATCH_SIZE = 12;
const MAX_ITEMS_IN_MEMORY = 100;

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
}

interface VideoGridProps {
   contents: ContentItem[];
   isFetching: boolean;
   hasMore: boolean;
   onLoadMore: () => void;
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
const VideoCard: FC<VideoCardProps> = ({ content }) => {
   const navigate = useNavigate();
   const youtubeId = extractYouTubeId(content.url);

   const thumbnailUrl =
      content.image && content.image !== "No image available"
         ? content.image
         : youtubeId
         ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
         : null;

   const handleWatch = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/content?id=${content._id}`);
   };

   return (
      <Card className="group overflow-hidden gap-0 cursor-pointer hover:shadow-lg transition-all duration-300 p-0 border-0">
         <div
            onClick={handleWatch}
            className="relative overflow-hidden bg-black aspect-video">
            {thumbnailUrl ? (
               <img
                  src={thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ImageOff className="w-12 h-12 text-muted-foreground/50" />
               </div>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
               <button
                  onClick={handleWatch}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  aria-label="Play video">
                  <Play className="w-6 h-6 text-black fill-black" />
               </button>
            </div>

            {content.duration && (
               <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
                  {content.duration}
               </div>
            )}

            <div className="absolute top-2 left-2">
               <Badge className="bg-black/70 text-white text-xs capitalize">
                  {content.category}
               </Badge>
            </div>
         </div>

         <CardContent className="p-3 space-y-2">
            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
               {content.title}
            </h3>

            <div className="flex flex-row justify-between mt-auto gap-4">
               <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground/70">{content.addedBy}</p>
                  <p className="line-clamp-1">{formatRelativeTime(content.createdAt)}</p>
               </div>
               <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="flex items-center justify-center gap-1 text-xs font-medium py-1 px-2 rounded hover:bg-muted">
                     <Heart className="w-3 h-3" />
                  </button>
                  <button className="flex items-center justify-center gap-1 text-xs font-medium py-1 px-2 rounded hover:bg-muted">
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
   <Card className="overflow-hidden gap-2 bg-background border-0">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-3 space-y-2">
         <Skeleton className="h-4 w-full" />
         <Skeleton className="h-4 w-3/4" />
         <Skeleton className="h-3 w-1/2" />
      </CardContent>
   </Card>
);

// Video Grid Component with Intersection Observer
const VideoGrid: FC<VideoGridProps> = ({ contents, isFetching, hasMore, onLoadMore }) => {
   const loaderRef = useRef<HTMLDivElement>(null);

   // Smooth stable observer
   useEffect(() => {
      const node = loaderRef.current;
      if (!node) return;

      const observer = new IntersectionObserver(
         (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && hasMore && !isFetching) {
               onLoadMore();
            }
         },
         {
            root: null,
            rootMargin: "300px",
            threshold: 0,
         }
      );

      observer.observe(node);

      return () => {
         observer.unobserve(node);
         observer.disconnect();
      };
   }, [hasMore, isFetching, onLoadMore]);

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {contents.map((content) => (
               <VideoCard
                  key={content._id}
                  content={content}
               />
            ))}
         </div>

         {isFetching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
               {[...Array(3)].map((_, i) => (
                  <VideoCardSkeleton key={i} />
               ))}
            </div>
         )}

         {/* observer trigger */}
         <div
            ref={loaderRef}
            className="h-5"
         />

         {!hasMore && (
            <div className="flex justify-center py-8">
               <p className="text-sm text-muted-foreground">No more content to load</p>
            </div>
         )}
      </div>
   );
};

// Main Container Component
const ContentContainer: FC = () => {
   const [allContents, setAllContents] = useState<ContentItem[]>([]);
   const [page, setPage] = useState<number>(0);
   const [hasMore, setHasMore] = useState<boolean>(true);
   const searchValue = useSelector((state: RootState) => state.search.searchValue);

   const { data, isLoading, isFetching } = useGetPublicContentsQuery({
      page,
      limit: BATCH_SIZE,
      search: searchValue,
   }) as { data?: ContentResponse; isLoading: boolean; isFetching: boolean };

   // Reset on search
   useEffect(() => {
      setPage(0);
      setAllContents([]);
      setHasMore(true);
   }, [searchValue]);

   // Add new content
   useEffect(() => {
      if (data?.data?.content) {
         setAllContents((prev) => {
            const combined = [...prev, ...data.data.content];
            const unique = Array.from(new Map(combined.map((i) => [i._id, i])).values());

            return unique.slice(-MAX_ITEMS_IN_MEMORY);
         });

         setHasMore(data.data.pagination?.hasNext ?? false);
      }
   }, [data]);

   const handleLoadMore = useCallback(() => {
      if (!isFetching && hasMore) {
         setPage((p) => p + 1);
      }
   }, [isFetching, hasMore]);

   return (
      <div className="min-h-screen bg-background">
         <div className="w-full">
            {isLoading && allContents.length === 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                     <VideoCardSkeleton key={i} />
                  ))}
               </div>
            ) : allContents.length > 0 ? (
               <VideoGrid
                  contents={allContents}
                  isFetching={isFetching}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
               />
            ) : (
               <div className="flex animate-in fade-in duration-500 flex-col items-center justify-center py-16">
                  <ImageOff className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No content found</h3>
                  <p className="text-sm text-muted-foreground/70">
                     Check back later for new videos
                  </p>
               </div>
            )}
         </div>
      </div>
   );
};

export default ContentContainer;
