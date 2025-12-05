import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type TableLoadingProps = {
   rows?: number;
   cols: number;
};

export const TableLoading = ({ rows = 5, cols }: TableLoadingProps) => {
   return (
      <>
         {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
               {Array.from({ length: cols }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                     <Skeleton className="h-4 w-full" />
                  </TableCell>
               ))}
            </TableRow>
         ))}
      </>
   );
};
