import { useGetPublicContentsQuery } from "@/redux-store/apis_action/content";
import { useState, type FC, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Heart, Share2, ImageOff, Plus, Video, Sparkles, Check } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import type { RootState } from "@/redux-store";
import { useSelector, useDispatch } from "react-redux";
import { setSearchValue } from "@/redux-store/slices/searchSlice";
import { toast } from "sonner";

// Constants
const BATCH_SIZE = 18;
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

   if (diffMinutes < 1) return "just now";
   if (diffMinutes < 60) return `${diffMinutes}m ago`;
   if (diffHours < 24) return `${diffHours}h ago`;
   if (diffDays < 7) return `${diffDays}d ago`;
   if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
   return `${Math.floor(diffDays / 30)}mo ago`;
};

// Category style helper
const getCategoryStyle = (category?: string) => {
   const cat = (category || "").toLowerCase();
   if (cat.includes("cartoon") || cat.includes("animation")) {
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
   }
   if (cat.includes("learning") || cat.includes("education") || cat.includes("abc")) {
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
   }
   if (cat.includes("rhyme") || cat.includes("song") || cat.includes("music")) {
      return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20";
   }
   if (cat.includes("story") || cat.includes("tale")) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
   }
   if (cat.includes("science") || cat.includes("fun")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
   }
   return "bg-primary/10 text-primary border-primary/20";
};

// Video Card Component
const VideoCard: FC<VideoCardProps> = ({ content }) => {
   const navigate = useNavigate();
   const [isLiked, setIsLiked] = useState(false);
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

   const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsLiked((prev) => {
         const next = !prev;
         if (next) {
            toast.success("Saved to your favorites!");
         }
         return next;
      });
   };

   const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const shareUrl = `${window.location.origin}/content?id=${content._id}`;
      try {
         await navigator.clipboard.writeText(shareUrl);
         toast.success("Video link copied to clipboard!");
      } catch {
         toast.info("Video link: " + shareUrl);
      }
   };

   const initials = (content.addedBy || "KT")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

   return (
      <Card
         onClick={handleWatch}
         className="group overflow-hidden rounded-2xl border border-border/70 hover:border-primary/40 bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-0 flex flex-col cursor-pointer">
         {/* Thumbnail Container */}
         <div className="relative overflow-hidden bg-black/90 aspect-video w-full">
            {thumbnailUrl ? (
               <img
                  src={thumbnailUrl}
                  alt={content.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
               />
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center bg-muted/60 text-muted-foreground/60">
                  <ImageOff className="w-10 h-10 mb-1" />
                  <span className="text-xs">No thumbnail</span>
               </div>
            )}

            {/* Gradient Overlay & Play Button */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <div className="p-3.5 rounded-full bg-primary/95 text-primary-foreground shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300 ring-4 ring-white/20">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
               </div>
            </div>

            {/* Duration Badge */}
            {content.duration && (
               <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                  {content.duration}
               </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-2.5 left-2.5">
               <span
                  className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md bg-black/60 text-white`}>
                  {content.category}
               </span>
            </div>
         </div>

         {/* Content Information */}
         <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
               <div className="flex items-start gap-2.5">
                  <div className="size-7 rounded-full bg-gradient-to-tr from-primary to-sky-400 text-primary-foreground flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                     {initials}
                  </div>
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                     {content.title}
                  </h3>
               </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs text-muted-foreground">
               <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground/80 truncate max-w-[120px]">
                     {content.addedBy || "KidzTube Studio"}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeTime(content.createdAt)}</span>
               </div>

               {/* Quick Action Buttons */}
               <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                     onClick={handleLike}
                     aria-label="Like video"
                     className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${
                        isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground"
                     }`}>
                     <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                  </button>
                  <button
                     onClick={handleShare}
                     aria-label="Share video link"
                     className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                     <Share2 className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
         </CardContent>
      </Card>
   );
};

// Skeleton Loading Card
const VideoCardSkeleton: FC = () => (
   <Card className="overflow-hidden rounded-2xl border border-border/40 bg-card p-0 flex flex-col">
      <Skeleton className="aspect-video w-full rounded-t-2xl rounded-b-none" />
      <CardContent className="p-4 space-y-3">
         <div className="flex items-start gap-2.5">
            <Skeleton className="size-7 rounded-full flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-3/4" />
            </div>
         </div>
         <div className="flex justify-between pt-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-16" />
         </div>
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
      <div className="space-y-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {contents.map((content) => (
               <VideoCard
                  key={content._id}
                  content={content}
               />
            ))}
         </div>

         {isFetching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
               {[...Array(3)].map((_, i) => (
                  <VideoCardSkeleton key={i} />
               ))}
            </div>
         )}

         {/* observer trigger */}
         <div
            ref={loaderRef}
            className="h-6"
         />

         {!hasMore && contents.length > 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center border-t border-border/40">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 text-xs text-muted-foreground font-medium">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  <span>You're all caught up with the latest videos</span>
               </div>
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
   const [activeCategory, setActiveCategory] = useState<string>("All");

   const dispatch = useDispatch();
   const searchValue = useSelector((state: RootState) => state.search.searchValue);

   const categories = [
      "All",
      "Cartoons",
      "Learning",
      "Nursery Rhymes",
      "Stories",
      "Science",
      "Crafts & DIY",
      "Music",
   ];

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

   const handleCategorySelect = (category: string) => {
      setActiveCategory(category);
      if (category === "All") {
         dispatch(setSearchValue(""));
      } else {
         dispatch(setSearchValue(category));
      }
   };

   return (
      <div className="w-full space-y-5">
         {/* Filter Pills Bar */}
         <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
               const isActive = activeCategory === cat;
               return (
                  <button
                     key={cat}
                     onClick={() => handleCategorySelect(cat)}
                     className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActive
                           ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 ring-2 ring-primary/20"
                           : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                     }`}>
                     {cat}
                  </button>
               );
            })}
         </div>

         {/* Content Grid / Empty / Loading */}
         <div className="w-full">
            {isLoading && allContents.length === 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
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
               <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-xs">
                     <Video className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">No videos found</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                     {searchValue
                        ? `No results matching "${searchValue}". Try searching for something else or clear the filter.`
                        : "There are no videos available in this section yet. Publish your first video to get started!"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                     {searchValue && (
                        <button
                           onClick={() => handleCategorySelect("All")}
                           className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-muted transition-colors">
                           Clear Search Filter
                        </button>
                     )}
                     <Link
                        to="/content/post"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                        <span>Publish New Video</span>
                     </Link>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default ContentContainer;

