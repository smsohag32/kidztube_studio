import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User, UserX, Edit, CheckCircle, XCircle, Trash2, Search, X } from "lucide-react";

import { toast } from "sonner";
import { useUsersLogic } from "./useUserLogic";

import type { User as UserType, UserFormData } from "@/types";

import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { PaginationControls } from "@/components/pagination/PaginationControl";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card } from "@/components/ui/card";
import { displayErrors } from "@/helpers/error";
import { UserFormDialog } from "./UserFormDialog";
import { AlertDialog } from "@/components/Modal/AlertDialog";
import { useSearchParams } from "react-router-dom";

const SystemUsers = () => {
   const {
      users,
      roles,

      isUsersLoading,
      isRolesLoading,

      isCreatingUser,
      isEditingUser,
      isChangingStatus,
      handleCreate,
      handleEdit,
      handleChangeStatus,
      handleDelete,
      refetchUsers,
      search,
      setSearch,
      setPage,
      status,
      setStatus,
      departments,
      branches,
   } = useUsersLogic();

   const pagination = users?.data?.pagination ||
      users?.data?.pagination || {
         currentPage: 1,
         totalPages: 1,
      };
   const [searchParams] = useSearchParams();
   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
   const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
   const [formData, setFormData] = useState<UserFormData>({
      fullName: "",
      username: "",
      email: "",
      roleId: null,
      phone: "",
   });

   const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
   const [pendingStatusUser, setPendingStatusUser] = useState<UserType | null>(null);

   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [pendingDeleteUser, setPendingDeleteUser] = useState<UserType | null>(null);

   const resetForm = () =>
      setFormData({
         fullName: "",
         username: "",
         email: "",
         phone: "",
         roleId: null,
      });

   // handle the open rm create
   useEffect(() => {
      if (searchParams.get("isCreate") === "true") {
         setIsCreateDialogOpen(true);
      }
   }, [searchParams]);
   const handleCreateUser = async () => {
      try {
         await handleCreate(formData);
         toast.success("User created successfully");
         setIsCreateDialogOpen(false);
         resetForm();
         refetchUsers();
      } catch (err) {
         displayErrors(err);
      }
   };

   const handleEditUser = async () => {
      if (!selectedUser) return;
      try {
         await handleEdit(selectedUser.id, {
            ...formData,
         });
         toast.success("User updated successfully");
         setIsEditDialogOpen(false);
         setSelectedUser(null);
         resetForm();
         refetchUsers();
      } catch (err) {
         displayErrors(err);
      }
   };

   const confirmStatusChange = (user: UserType) => {
      setPendingStatusUser(user);
      setIsStatusDialogOpen(true);
   };

   const handleConfirmStatusChange = async () => {
      if (!pendingStatusUser) return;
      try {
         await handleChangeStatus(pendingStatusUser.id);
         toast.success(`User status changed successfully`);
         refetchUsers();
      } catch {
         toast.error("Failed to change user status");
      }
      setIsStatusDialogOpen(false);
      setPendingStatusUser(null);
   };

   const confirmDeleteUser = (user: UserType) => {
      setPendingDeleteUser(user);
      setIsDeleteDialogOpen(true);
   };

   const handleConfirmDelete = async () => {
      if (!pendingDeleteUser) return;
      try {
         await handleDelete(pendingDeleteUser.id);
         toast.success("User deleted successfully");
         refetchUsers();
      } catch {
         toast.error("Failed to delete user");
      }
      setIsDeleteDialogOpen(false);
      setPendingDeleteUser(null);
   };

   const openEditDialog = (user: any | unknown) => {
      setSelectedUser(user);
      setFormData({
         fullName: user.fullName,
         username: user.username,
         email: user.email,
         phone: user.phone || "",
         roleId: user.role?.id || null,
         departmentId: user.departmentId || "",
         branchId: user.branchId || "",
      });
      setIsEditDialogOpen(true);
   };

   const filteredUsers = users?.data.content || [];

   return (
      <Card className="space-y-1 p-5">
         {/* Header */}
         <div className="flex items-end justify-between">
            <div>
               <h1 className="text-[24px] flex items-center gap-2 font-semibold tracking-tight">
                  <User className="text-gray-700" /> User Management
               </h1>
               <p className="text-muted-foreground">Manage users</p>
            </div>
            <div className="flex  gap-4">
               <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2">
                  <Plus className="h-4 w-4" /> Create User
               </Button>
            </div>
         </div>
         <div className=" space-y-4">
            <div className="flex items-center gap-4 justify-between ">
               <div className="w-full">
                  <Tabs
                     value={status}
                     onValueChange={(val) => setStatus(val)}>
                     <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="inactive">Deactivated</TabsTrigger>
                     </TabsList>
                  </Tabs>
               </div>
               <div className="relative w-full max-w-md">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Search here…"
                     className="pl-8 pr-8"
                  />
                  {search && (
                     <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        title="Clear">
                        <X className="h-4 w-4 text-muted-foreground" />
                     </button>
                  )}
               </div>
            </div>

            {isRolesLoading || isUsersLoading ? (
               <div className="flex items-center justify-center min-h-[400px]">
                  <></>
               </div>
            ) : (
               <>
                  {filteredUsers?.length > 0 ? (
                     <div className="table-res">
                        <Table className="w-full">
                           <TableHeader>
                              <TableRow>
                                 <TableHead>#</TableHead>
                                 <TableHead>Username</TableHead>

                                 <TableHead>User Info</TableHead>
                                 <TableHead>Dept.</TableHead>
                                 <TableHead>Branch</TableHead>

                                 <TableHead>Role</TableHead>
                                 <TableHead>Status</TableHead>
                                 <TableHead className="text-end">Action</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {filteredUsers.map((user: any, index: number) => (
                                 <TableRow key={user.id}>
                                    <TableCell>
                                       {pagination.currentPage * (pagination.pageSize || 10) +
                                          (index + 1)}
                                    </TableCell>

                                    <TableCell>{user?.username}</TableCell>

                                    <TableCell>
                                       <p className="font-semibold"> {user?.fullName}</p>
                                       <p className="text-xs">{user?.email}</p>
                                       <p className="text-xs">{user?.phone}</p>
                                    </TableCell>

                                    <TableCell>{user?.department || "-"}</TableCell>
                                    <TableCell>{user?.branch || "-"}</TableCell>

                                    <TableCell>
                                       {user.role ? (
                                          <Badge variant="secondary">{user?.role?.name}</Badge>
                                       ) : (
                                          <Badge variant="destructive">No Role</Badge>
                                       )}
                                    </TableCell>
                                    <TableCell>
                                       {user.status ? (
                                          <Badge
                                             variant="secondary"
                                             className="flex items-center gap-1">
                                             <CheckCircle className="h-4 w-4" /> Active
                                          </Badge>
                                       ) : (
                                          <Badge
                                             variant="destructive"
                                             className="flex items-center gap-1">
                                             <XCircle className="h-4 w-4" /> Deactivated
                                          </Badge>
                                       )}
                                    </TableCell>

                                    <TableCell className="flex gap-4 justify-end items-center">
                                       <Switch
                                          checked={user.status}
                                          onCheckedChange={() => confirmStatusChange(user)}
                                       />
                                       {/* Edit Icon Button */}
                                       <Button
                                          size="icon"
                                          variant="outline"
                                          onClick={() => openEditDialog(user)}>
                                          <Edit className="h-4 w-4" />
                                       </Button>

                                       {/* Switch for status change */}

                                       {/* Delete Icon Button */}
                                       <Button
                                          size="icon"
                                          variant="destructive"
                                          onClick={() => confirmDeleteUser(user)}>
                                          <Trash2 className="h-4 w-4" />
                                       </Button>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                        <div className="mt-auto pt-6 flex justify-center">
                           <PaginationControls
                              currentPage={pagination.currentPage}
                              totalPages={pagination.totalPages}
                              onPageChange={(newPage) => setPage(newPage)}
                           />
                        </div>
                     </div>
                  ) : (
                     <div className="flex items-center gap-4 justify-center text-[20px] flex-col min-h-[400px]">
                        <UserX
                           className="text-gray-500"
                           size={60}
                        />
                        <p className="text-muted-foreground">No Users Found</p>
                     </div>
                  )}
               </>
            )}
         </div>

         {/* Dialogs */}
         <UserFormDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            formData={formData}
            setFormData={setFormData}
            roles={roles?.data || []}
            branches={branches}
            departments={departments}
            onSubmit={handleCreateUser}
            isSubmitting={isCreatingUser}
            mode="create"
         />

         <UserFormDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            formData={formData}
            setFormData={setFormData}
            roles={roles?.data || []}
            branches={branches}
            departments={departments}
            onSubmit={handleEditUser}
            isSubmitting={isEditingUser}
            mode="edit"
         />

         <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Delete User"
            description={`Are you sure you want to delete ${pendingDeleteUser?.fullName}? This action cannot be undone.`}
            confirmText="Delete"
            variant="destructive"
            onConfirm={handleConfirmDelete}
         />

         <AlertDialog
            open={isStatusDialogOpen}
            onOpenChange={setIsStatusDialogOpen}
            title="Change User Status"
            description={`Are you sure you want to ${
               !pendingStatusUser?.status ? "activate" : "deactivate"
            } ${pendingStatusUser?.fullName}?`}
            confirmText="Confirm"
            variant={!pendingStatusUser?.status ? "default" : "destructive"}
            onConfirm={handleConfirmStatusChange}
            isSubmitting={isChangingStatus}
         />
      </Card>
   );
};

export default SystemUsers;
