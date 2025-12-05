import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/ui/dialog";

interface ModalProps {
   open: boolean;
   setOpen: (open: boolean) => void;
   title?: React.ReactNode;
   footer?: React.ReactNode;
   children: React.ReactNode;
   size?: "sm" | "md" | "lg";
   maxHeight?: string;
}

export const Modal = ({
   open,
   setOpen,
   title,
   footer,
   children,
   size = "md",
   maxHeight = "70vh",
}: ModalProps) => {
   const sizeClasses = {
      sm: "sm:max-w-[300px]",
      md: "sm:max-w-[500px]",
      lg: "sm:max-w-[800px]",
   };

   return (
      <Dialog
         open={open}
         modal={true}
         onOpenChange={setOpen}>
         <DialogContent className={`${sizeClasses[size]} p-0`}>
            {title && (
               <DialogHeader className="px-6 pt-6">
                  <DialogTitle>{title}</DialogTitle>
               </DialogHeader>
            )}

            {/* Scrollable content area */}
            <div
               className="mt-2 overflow-auto"
               style={{ maxHeight }}>
               {children}
            </div>

            {footer && <DialogFooter className="px-6 pb-5">{footer}</DialogFooter>}
         </DialogContent>
      </Dialog>
   );
};
