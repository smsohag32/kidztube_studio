export interface DialogState {
   isOpen: boolean;
   type: "delete" | "status" | "bulk-delete";
   itemId: string;
   itemTitle: string;
   currentStatus?: boolean;
}
