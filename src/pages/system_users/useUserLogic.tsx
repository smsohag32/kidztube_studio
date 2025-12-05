import { useGetAllBranchQuery } from "@/redux-store/apis_action/branch_control";
import { useGetAllDepartmentQuery } from "@/redux-store/apis_action/department_control";
import { useGetRolesForDropdownQuery } from "@/redux-store/apis_action/role";
import {
   useGetUsersQuery,
   useCreateUserMutation,
   useEditUserMutation,
   useChangeUserStatusMutation,
   useDeleteUserMutation,
} from "@/redux-store/apis_action/user";
import type { User, UserFormData } from "@/types";
import { useState } from "react";

export const useUsersLogic = () => {
   const [search, setSearch] = useState("");
   const [page, setPage] = useState(0);
   const [status, setStatus] = useState("all");

   const {
      data: branches,
      isLoading: isBranchesLoading,
      refetch: refetchBranches,
   } = useGetAllBranchQuery();
   const {
      data: departments,
      isLoading: isDepartmentsLoading,
      refetch: refetchDepartments,
   } = useGetAllDepartmentQuery();
   // Queries
   const {
      data: users,
      isLoading: isUsersLoading,
      refetch: refetchUsers,
   } = useGetUsersQuery({ status: status, limit: 10, query: search, page: page });

   const {
      data: roles,
      isLoading: isRolesLoading,
      refetch: refetchRoles,
   } = useGetRolesForDropdownQuery("");

   // Mutations
   const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
   const [editUser, { isLoading: isEditingUser }] = useEditUserMutation();
   const [changeUserStatus, { isLoading: isChangingStatus }] = useChangeUserStatusMutation();
   const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

   // Handlers
   const handleCreate = async (userData: UserFormData) => {
      try {
         await createUser(userData).unwrap();
         refetchUsers();
      } catch (err) {
         console.error("Error creating user:", err);
         throw err;
      }
   };

   const handleEdit = async (userId: number | string | null | undefined, userData: User) => {
      try {
         if (!userData || typeof userData !== "object") throw new Error("Invalid user data");
         await editUser({ userId, ...userData }).unwrap();
         refetchUsers();
      } catch (err) {
         console.error("Error editing user:", err);
         throw err;
      }
   };

   const handleChangeStatus = async (userId: number | string | undefined) => {
      try {
         await changeUserStatus({ userId }).unwrap();
         refetchUsers();
      } catch (err) {
         console.error("Error changing user status:", err);
         throw err;
      }
   };

   const handleDelete = async (userId: number | string | undefined) => {
      try {
         if (!userId) throw new Error("Invalid user ID");
         await deleteUser(userId).unwrap();
         refetchUsers();
      } catch (err) {
         console.error("Error deleting user:", err);
         throw err;
      }
   };

   return {
      // Data
      users,
      roles,

      departments,
      branches,
      isBranchesLoading,
      isDepartmentsLoading,
      refetchBranches,
      refetchDepartments,
      // State
      search,
      setSearch,
      page,
      setPage,
      status,
      setStatus,

      // Loading states
      isUsersLoading,
      isRolesLoading,
      isCreatingUser,
      isEditingUser,
      isChangingStatus,
      isDeletingUser,

      // Handlers
      handleCreate,
      handleEdit,
      handleChangeStatus,
      handleDelete,

      // Refetch
      refetchUsers,
      refetchRoles,
   };
};
