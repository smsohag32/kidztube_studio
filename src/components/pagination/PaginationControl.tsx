import {
   Pagination,
   PaginationContent,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils"; // or clsx if you use that

interface PaginationControlsProps {
   currentPage: number; // 0-based
   totalPages: number;
   onPageChange: (page: number) => void;
   maxVisible?: number;
}

export function PaginationControls({
   currentPage,
   totalPages,
   onPageChange,
   maxVisible = 5,
}: PaginationControlsProps) {
   if (totalPages <= 1) return null;

   const safeOnPageChange = (page: number) => {
      if (page >= 0 && page < totalPages && page !== currentPage) {
         onPageChange(page);
      }
   };

   const getPageNumbers = () => {
      const pages: (number | "ellipsis")[] = [];
      const half = Math.floor(maxVisible / 2);

      if (totalPages <= maxVisible + 2) {
         return Array.from({ length: totalPages }, (_, i) => i);
      }

      pages.push(0);

      const start = Math.max(1, currentPage - half);
      const end = Math.min(totalPages - 2, currentPage + half);

      if (start > 1) pages.push("ellipsis");
      for (let i = start; i <= end; i++) {
         pages.push(i);
      }
      if (end < totalPages - 2) pages.push("ellipsis");

      pages.push(totalPages - 1);
      return pages;
   };

   const pages = getPageNumbers();

   return (
      <div className="flex items-center justify-between w-full">
         {/* Left side: Current page info */}
         <div className="text-sm whitespace-nowrap text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
         </div>

         {/* Right side: Actual pagination */}
         <div>
            <Pagination>
               <PaginationContent>
                  <PaginationItem>
                     <PaginationPrevious
                        aria-label="Previous page"
                        aria-disabled={currentPage === 0}
                        onClick={() => safeOnPageChange(currentPage - 1)}
                        className={cn(currentPage === 0 && "pointer-events-none opacity-50")}
                     />
                  </PaginationItem>

                  {pages.map((page, idx) =>
                     page === "ellipsis" ? (
                        <PaginationItem
                           key={`ellipsis-${idx}`}
                           className="px-2 text-muted-foreground">
                           …
                        </PaginationItem>
                     ) : (
                        <PaginationItem key={page}>
                           <PaginationLink
                              onClick={() => safeOnPageChange(page)}
                             
                              isActive={page === currentPage}>
                              {page + 1}
                           </PaginationLink>
                        </PaginationItem>
                     )
                  )}

                  <PaginationItem>
                     <PaginationNext
                        aria-label="Next page"
                        aria-disabled={currentPage === totalPages - 1}
                        onClick={() => safeOnPageChange(currentPage + 1)}
                        className={cn(
                           currentPage === totalPages - 1 && "pointer-events-none opacity-50"
                        )}
                     />
                  </PaginationItem>
               </PaginationContent>
            </Pagination>
         </div>
      </div>
   );
}
