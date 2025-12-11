export type Role = {
   id: number;
   name: string;
   permissionList: any[];
   active?: boolean;
};
export interface User {
   id?: number;
   fullName: string;
   username: string;
   email: string;
   role?: Role;
   phone?: string;
   image?: string;
   status?: boolean;
}
export type RoleFormData = {
   name: string;
   active?: boolean;
   permissionIds: number[];
};

export interface UserFormData {
   fullName: string;
   username: string;
   email: string;
   phone?: string;
   roleId?: number | null;
   branchId?: any;
   departmentId?: any;
   password?: string;
}

export interface FormErrors {
   fullName?: string;
   username?: string;
   password?: string;
   email?: string;
   roleId?: string;
   general?: string;
   phone?: string;
}
