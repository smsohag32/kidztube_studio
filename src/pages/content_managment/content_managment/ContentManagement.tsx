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
      <div className="">
         <h1 className="text-2xl font-bold mb-6">Content Management</h1>

         {/* Filters and Tabs */}
         <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 flex gap-2">
               <Input
                  placeholder="Search by title, URL, or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
               />
               <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="flex gap-2 items-center">
               <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}>
                  <TabsList>
                     <TabsTrigger value="approved">Approved</TabsTrigger>
                     <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
               </Tabs>
               <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-40">
                     <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Status</SelectItem>
                     <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
               </Select>
               <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={!selectedItems.size}>
                  {bulkDeleting ? "Deleting" : `Bulk Delete (${selectedItems.size})`}
               </Button>
            </div>
         </div>

         {/* Table */}
         <div className="table-res">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-12">
                        <Checkbox
                           checked={content?.every((item) => selectedItems.has(item._id)) ?? false}
                           onCheckedChange={(value) => toggleSelectAll(value === true)}
                           aria-label="Select all content"
                        />
                     </TableHead>
                     <TableHead>URL</TableHead>
                     <TableHead>Title</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Approval</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading || isFetching ? (
                     <TableRow>
                        <TableCell
                           colSpan={7}
                           className="text-center py-8">
                           <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-900 rounded-full" />
                              Loading content...
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : content?.length ? (
                     content.map((item) => (
                        <TableRow key={item._id}>
                           <TableCell>
                              <Checkbox
                                 checked={selectedItems.has(item._id)}
                                 onCheckedChange={(value) =>
                                    toggleSelectItem(item._id, value === true)
                                 }
                                 aria-label={`Select ${item.title}`}
                              />
                           </TableCell>
                           <TableCell>
                              <a
                                 href={item.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-blue-600 underline truncate block"
                                 title={item.url}>
                                 {item.url}
                              </a>
                           </TableCell>
                           <TableCell>{item.title || "Unknown Title"}</TableCell>
                           <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                           </TableCell>
                           <TableCell>
                              <Switch
                                 checked={item.status}
                                 onCheckedChange={() =>
                                    openStatusDialog(item._id, item.title, item.status)
                                 }
                              />
                           </TableCell>
                           <TableCell>
                              <Badge variant={item.isApproved ? "default" : "secondary"}>
                                 {item.isApproved ? "Approved" : "Pending"}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-right flex justify-end gap-2">
                              <Button
                                 variant="outline"
                                 size="sm">
                                 <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => openDeleteDialog(item._id, item.title)}
                                 className="hover:bg-red-50 hover:text-red-600">
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell
                           colSpan={7}
                           className="text-center py-8 text-gray-500">
                           No content found.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         {/* Pagination */}
         {content?.length && (
            <div className="mt-4 flex justify-between">
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
