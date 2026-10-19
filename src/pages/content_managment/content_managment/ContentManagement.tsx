"use client";

import { useEffect, useState, useCallback } from "react";
import {
   useBulkDeleteMutation,
   useChangeContentStatusMutation,
   useDeleteContentMutation,
   useGetAdminContentQuery,
} from "@/redux-store/apis_action/content_management";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { PaginationControls } from "@/components/pagination/PaginationControl";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { ContentItem } from "@/types/content";
import type { DialogState } from "@/types/dialog";
import { Checkbox } from "@/components/ui/checkbox";

type TabType = "approved" | "pending";
type StatusFilter = "all" | "active" | "inactive";

const ContentManagement = () => {
   const [page, setPage] = useState(0);
   const [query, setQuery] = useState("");
   const [limit] = useState(10);
   const [activeTab, setActiveTab] = useState<TabType>("approved");
   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
   const [deleteContent] = useDeleteContentMutation();
   const [bulkDelete, { isLoading: bulkDeleting }] = useBulkDeleteMutation();
   const [changeContentStatus] = useChangeContentStatusMutation();
   const [dialogState, setDialogState] = useState<DialogState>({
      isOpen: false,
      type: "delete",
      itemId: "",
      itemTitle: "",
   });
   const [isProcessing, setIsProcessing] = useState(false);

   const { data, isLoading, isFetching } = useGetAdminContentQuery({
      page,
      limit,
      search: query,
      status: statusFilter === "all" ? undefined : statusFilter === "active",
      approved: activeTab === "approved" ? true : false,
   });

   const content = data?.data?.content as ContentItem[] | undefined;
   const totalPages = data?.data?.pagination?.totalPages ?? 0;

   // Maintain selection state across pages
   useEffect(() => {
      setPage(0);
   }, [activeTab, statusFilter, query]);

   const toggleSelectAll = useCallback(
      (checked: boolean) => {
         if (!content) return;
         const newSelected = new Set(selectedItems);

         if (checked) {
            content.forEach((item) => newSelected.add(item._id));
         } else {
            content.forEach((item) => newSelected.delete(item._id));
         }

         setSelectedItems(newSelected);
      },
      [content, selectedItems]
   );

   const toggleSelectItem = useCallback(
      (id: string, checked: boolean) => {
         const newSelected = new Set(selectedItems);
         if (checked) newSelected.add(id);
         else newSelected.delete(id);
         setSelectedItems(newSelected);
      },
      [selectedItems]
   );

   const handleBulkDelete = useCallback(() => {
      if (!selectedItems.size) {
         toast.error("No content selected for deletion.");
         return;
      }
      setDialogState({
         isOpen: true,
         type: "bulk-delete",
         itemId: "",
         itemTitle: `${selectedItems.size} items`,
      });
   }, [selectedItems]);

   const handleConfirm = useCallback(async () => {
      setIsProcessing(true);
      try {
         if (dialogState.type === "delete" && dialogState.itemId) {
            await deleteContent(dialogState.itemId).unwrap();
            toast.success(`"${dialogState.itemTitle}" deleted successfully`);
            selectedItems.delete(dialogState.itemId);
            setSelectedItems(new Set(selectedItems));
         } else if (dialogState.type === "status" && dialogState.itemId) {
            const newStatus = !dialogState.currentStatus;
            await changeContentStatus({ id: dialogState.itemId, status: newStatus });
            toast.success(`"${dialogState.itemTitle}" is now ${newStatus ? "active" : "inactive"}`);
         } else if (dialogState.type === "bulk-delete") {
            const ids = Array.from(selectedItems);
            const result = await bulkDelete({ ids }).unwrap();
            toast.success(`${result.totalDeleted} items deleted successfully`);
            // Remove deleted items from selection
            const remaining = new Set(selectedItems);
            result.successful.forEach((id: string) => remaining.delete(id));
            setSelectedItems(remaining);
            setPage(0);
         }
         setDialogState({ isOpen: false, type: "delete", itemId: "", itemTitle: "" });
      } catch (error) {
         console.error(error);
         toast.error("An error occurred. Please try again.");
      } finally {
         setIsProcessing(false);
      }
   }, [dialogState, deleteContent, changeContentStatus, bulkDelete, selectedItems]);

   const closeDialog = useCallback(() => {
      if (!isProcessing) {
         setDialogState({ isOpen: false, type: "delete", itemId: "", itemTitle: "" });
      }
   }, [isProcessing]);

   const openDeleteDialog = useCallback((id: string, title: string) => {
      setDialogState({ isOpen: true, type: "delete", itemId: id, itemTitle: title });
   }, []);

   const openStatusDialog = useCallback((id: string, title: string, currentStatus: boolean) => {
      setDialogState({
         isOpen: true,
         type: "status",
         itemId: id,
         itemTitle: title,
         currentStatus,
      });
   }, []);

   const handleSearch = useCallback(() => setPage(0), []);
   const handleTabChange = useCallback((v: string) => {
      setActiveTab(v as TabType);
      setPage(0);
   }, []);
   const handleStatusFilterChange = useCallback((v: string) => {
      setStatusFilter(v as StatusFilter);
      setPage(0);
   }, []);

   return (
      <div className="space-y-6">
         {/* Page Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Management</h1>
               <p className="text-xs sm:text-sm text-muted-foreground">
                  Review, approve, and manage video statuses across the platform.
               </p>
            </div>
            <div className="flex items-center gap-2.5">
               <Button
                  asChild
                  className="rounded-xl text-xs font-semibold gap-1.5 shadow-xs">
                  <a href="/content/post">
                     <PlusCircle className="w-3.5 h-3.5" />
                     <span>New Video</span>
                  </a>
               </Button>
            </div>
         </div>

         {/* Filters and Tabs */}
         <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex gap-2">
               <Input
                  placeholder="Search by title, URL, or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="rounded-xl text-xs sm:text-sm h-10"
               />
               <Button
                  onClick={handleSearch}
                  className="rounded-xl text-xs font-semibold px-4 h-10">
                  Search
               </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
               <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}>
                  <TabsList className="h-10 rounded-xl p-1">
                     <TabsTrigger
                        value="approved"
                        className="rounded-lg text-xs font-semibold">
                        Approved
                     </TabsTrigger>
                     <TabsTrigger
                        value="pending"
                        className="rounded-lg text-xs font-semibold">
                        Pending
                     </TabsTrigger>
                  </TabsList>
               </Tabs>

               <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-36 h-10 rounded-xl text-xs font-medium">
                     <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                     <SelectItem value="all">All Status</SelectItem>
                     <SelectItem value="active">Active Only</SelectItem>
                     <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
               </Select>

               {selectedItems.size > 0 && (
                  <Button
                     variant="destructive"
                     onClick={handleBulkDelete}
                     className="rounded-xl text-xs font-semibold h-10 gap-1.5 animate-in fade-in">
                     <Trash2 className="w-3.5 h-3.5" />
                     {bulkDeleting ? "Deleting..." : `Delete (${selectedItems.size})`}
                  </Button>
               )}
            </div>
         </div>

         {/* Table Card */}
         <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-xs">
            <Table>
               <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                     <TableHead className="w-12 pl-4">
                        <Checkbox
                           checked={content?.length ? content.every((item) => selectedItems.has(item._id)) : false}
                           onCheckedChange={(value) => toggleSelectAll(value === true)}
                           aria-label="Select all content"
                        />
                     </TableHead>
                     <TableHead className="text-xs font-bold text-foreground">Video Title</TableHead>
                     <TableHead className="text-xs font-bold text-foreground">Category</TableHead>
                     <TableHead className="text-xs font-bold text-foreground">URL</TableHead>
                     <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
                     <TableHead className="text-xs font-bold text-foreground">Approval</TableHead>
                     <TableHead className="text-right text-xs font-bold text-foreground pr-4">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody className="divide-y divide-border/40">
                  {isLoading || isFetching ? (
                     <TableRow>
                        <TableCell
                           colSpan={7}
                           className="text-center py-12">
                           <div className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground font-medium">
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                              <span>Loading studio videos...</span>
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : content?.length ? (
                     content.map((item) => (
                        <TableRow
                           key={item._id}
                           className="hover:bg-muted/40 transition-colors">
                           <TableCell className="pl-4">
                              <Checkbox
                                 checked={selectedItems.has(item._id)}
                                 onCheckedChange={(value) =>
                                    toggleSelectItem(item._id, value === true)
                                 }
                                 aria-label={`Select ${item.title}`}
                              />
                           </TableCell>
                           <TableCell className="font-semibold text-xs text-foreground max-w-xs truncate">
                              {item.title || "Untitled Video"}
                           </TableCell>
                           <TableCell>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize border border-primary/20">
                                 {item.category || "General"}
                              </span>
                           </TableCell>
                           <TableCell className="max-w-[180px]">
                              <a
                                 href={item.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-primary hover:underline text-xs truncate block"
                                 title={item.url}>
                                 {item.url}
                              </a>
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center gap-2">
                                 <Switch
                                    checked={item.status}
                                    onCheckedChange={() =>
                                       openStatusDialog(item._id, item.title, item.status)
                                    }
                                 />
                                 <span className="text-[11px] font-medium text-muted-foreground">
                                    {item.status ? "Active" : "Paused"}
                                 </span>
                              </div>
                           </TableCell>
                           <TableCell>
                              {item.isApproved ? (
                                 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Approved
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    Pending
                                 </span>
                              )}
                           </TableCell>
                           <TableCell className="text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openDeleteDialog(item._id, item.title)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </Button>
                              </div>
                           </TableCell>
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell
                           colSpan={7}
                           className="text-center py-14 text-muted-foreground">
                           <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">No videos found</p>
                              <p className="text-xs text-muted-foreground">Try adjusting your filters or upload new content.</p>
                           </div>
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         {/* Pagination */}
         {Boolean(content?.length) && (
            <div className="flex justify-between items-center pt-2">
               <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
               />
            </div>
         )}


         {/* Confirmation Dialog */}
         <AlertDialog
            open={dialogState.isOpen}
            onOpenChange={closeDialog}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <div className="flex items-center gap-2">
                     <AlertCircle className="w-5 h-5 text-amber-600" />
                     <AlertDialogTitle>
                        {dialogState.type === "bulk-delete"
                           ? "Bulk Delete Content"
                           : dialogState.type === "delete"
                           ? "Delete Content"
                           : "Change Status"}
                     </AlertDialogTitle>
                  </div>
               </AlertDialogHeader>
               <AlertDialogDescription className="space-y-2">
                  {dialogState.type === "bulk-delete" ? (
                     <p>
                        Are you sure you want to delete {dialogState.itemTitle}? This action cannot
                        be undone.
                     </p>
                  ) : dialogState.type === "delete" ? (
                     <p>
                        Are you sure you want to delete <strong>{dialogState.itemTitle}</strong>?
                        This action cannot be undone.
                     </p>
                  ) : (
                     <p>
                        Change <strong>{dialogState.itemTitle}</strong> to{" "}
                        <strong>{!dialogState.currentStatus ? "active" : "inactive"}</strong>?
                     </p>
                  )}
               </AlertDialogDescription>
               <div className="flex justify-end gap-2 mt-4">
                  <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleConfirm}
                     disabled={isProcessing}
                     className={
                        dialogState.type === "delete" || dialogState.type === "bulk-delete"
                           ? "bg-red-600 hover:bg-red-700"
                           : ""
                     }>
                     {isProcessing ? "Processing..." : "Confirm"}
                  </AlertDialogAction>
               </div>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
};

export default ContentManagement;
