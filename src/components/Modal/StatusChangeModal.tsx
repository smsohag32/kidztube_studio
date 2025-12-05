import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LoanStatus from "../badge/LoanStatus";
import { useStatusChangeMutation } from "@/redux-store/apis_action/legal_module";
import { displayErrors } from "@/helpers/error";
import { toast } from "sonner";
import { History } from "lucide-react";

const StatusChangeModal = ({ loan }: { loan: any }) => {
   const [open, setOpen] = useState(false);
   const [changeStatus, { isLoading: loading }] = useStatusChangeMutation();
   const [status, setStatus] = useState<string | undefined | number>(
      loan?.legalCaseStatus == "Bad & Loss" ? "5" : "4"
   );

   const handleStatusChange = async () => {
      try {
         await changeStatus({ id: loan?.loanAccountNumber, status }).unwrap();
         toast.success("Status updated successfully.");
         setOpen(false);
      } catch (error) {
         displayErrors(error);
      }
   };

   return (
      <div className="p-4">
         <Button onClick={() => setOpen(true)}>
            <History />
            Update Loan Status
         </Button>
         <Dialog
            open={open}
            onOpenChange={setOpen}>
            <DialogContent className="!max-w-xl">
               <DialogHeader>
                  <div className="flex items-center w-full gap-4 p-4 bg-muted/30 rounded-lg">
                     <Avatar className="h-16 w-16">
                        <AvatarImage src={loan.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg font-semibold">
                           {loan.name
                              .split(" ")
                              .map((n: any) => n[0])
                              .join("")
                              .toUpperCase()}
                        </AvatarFallback>
                     </Avatar>

                     <div className="flex-1">
                        <h2 className="text-xl font-semibold">{loan.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-sm text-blue-600">
                              CustomerID# {loan.customerId}
                           </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                           <span>{loan.phone}</span>
                           <span>{loan.email}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                           <span>Current Loan Status:</span>
                           <LoanStatus status={loan?.legalCaseStatus} />
                        </div>
                     </div>
                  </div>
               </DialogHeader>

               <div className="flex flex-col gap-3 py-4">
                  <Label htmlFor="loan-status">Select Legal Status</Label>

                  <Select
                     value={String(status) || undefined}
                     onValueChange={(v) => setStatus(v || undefined)}>
                     <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Choose a status..."} />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="5">Bad & Loss</SelectItem>
                        <SelectItem value="4">Write-Off</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => setOpen(false)}
                     disabled={loading}>
                     Cancel
                  </Button>
                  <Button
                     onClick={handleStatusChange}
                     disabled={loading}>
                     {loading ? "Saving..." : "Save"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
};

export default StatusChangeModal;
