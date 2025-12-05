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

export interface StationGate {
   id: number;
   gateName: string;
   gateCode: string;
   stationId: string;
   stationName: string;
   status: boolean;
   type: "ENTRY" | "EXIT";
   macAddress?: string;
   ipAddress?: string;
   firmwareVersion?: string;
}

export interface StationGateFormData {
   gateName: string;
   gateCode: string;
   stationId: string;
   stationName: string;
   type: "ENTRY" | "EXIT";
   macAddress?: string;
   ipAddress?: string;
   firmwareVersion?: string;
}

export interface StationGateResponse {
   response: {
      codeStatus: string;
      descStatus: string;
      httpStatus: string;
      message: string;
      data: {
         content: StationGate[];
         pagination: {
            currentPage: number;
            pageSize: number;
            totalElements: number;
            totalPages: number;
            first: boolean;
            last: boolean;
            hasNext: boolean;
            hasPrevious: boolean;
         };
      };
   };
   errors: null;
   success: boolean;
}

export interface FormErrors {
   [key: string]: string | undefined;
}

export interface CustomerType {
   id: string | number;
   name: string;
   customerId?: string;
   phone?: string;
   loanId?: string;
   loanAccountNumber?: number | string;
}
