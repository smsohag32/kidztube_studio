import type { NavItem } from "@/components/layouts/nav-menu";

// Define types for clarity
interface Permission {
   permissionName: string;
   permissionCode: string;
}

const allPermissions: Permission[] = [
   { permissionName: "ROLE_MANAGEMENT", permissionCode: "01K5X66ENV8TZ1XMM2Z03PR7KC" },
   { permissionName: "MIS_MODULE", permissionCode: "01K5X66VGWGBDPTR53PVHT7WAP" },
   { permissionName: "RM_MANAGEMENT", permissionCode: "01K5X674Y5ZJB90M2YD8RFGRMK" },
   { permissionName: "BRANCH_MANAGEMENT", permissionCode: "01K5X67HTW7H7CBXQP3WBTDJ7G" },
   { permissionName: "DEPARTMENT_MANAGEMENT", permissionCode: "01K5X67W29MXVR29TNNW674FXM" },
   { permissionName: "CUSTOMER_MANAGEMENT", permissionCode: "01K5X68F1E0C82CK8KJ88EF925" },
   { permissionName: "REMINDER_MANAGEMENT", permissionCode: "01K7K6WYA04TERDV8N18PSQZPJ" },
   { permissionName: "SCHEDULER_MANAGEMENT", permissionCode: "01K858QT65YTV4Q8HMFMS01B31" },
];

// Precompute a map from code → name for fast lookup
const permissionMap: Map<string, string> = new Map(
   allPermissions.map((p) => [p.permissionCode, p.permissionName])
);

/**
 * permissionHelper:
 * Pass in an array of permission codes the user has,
 * and it will let you check by name or list all names.
 */
export const permissionHelper = (codes?: string[]) => {
   const userPermissionSet = new Set(
      (codes ?? [])
         .map((code) => permissionMap.get(code))
         .filter((name): name is string => Boolean(name))
   );

   return {
      hasPermission: (name: string): boolean => userPermissionSet.has(name),
      getPermissionNames: (): string[] => Array.from(userPermissionSet),
   };
};

/**
 * filterNavItems:
 * Filters NavItem array based on permissions or staticRoles (role-based visibility)
 */
export const filterNavItems = (
   items: NavItem[],
   hasPermission: (name: string) => boolean,
   userRole?: string
): NavItem[] => {
   return items
      .filter((item) => {
         // Static role check (for items like "My Customers")
         if (item.staticRoles?.length) {
            return userRole ? item.staticRoles.includes(userRole) : false;
         }

         // Permission check
         if (!item.requiredPermission) return true;

         if (Array.isArray(item.requiredPermission)) {
            return item.requiredPermission.some((perm) => hasPermission(perm));
         }

         return hasPermission(item.requiredPermission);
      })
      .map((item) => ({
         ...item,
         items: item.items ? filterNavItems(item.items, hasPermission, userRole) : undefined,
      }));
};
