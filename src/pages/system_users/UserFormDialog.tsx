import * as React from "react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Shield, Phone, AlertCircle, Loader2, Users, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserFormData, FormErrors } from "@/types";
import { SearchableDropdown } from "@/components/select/SearchableSelect";

interface Props {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   formData: UserFormData;
   setFormData: (data: UserFormData) => void;
   roles: any[];
   departments?: any;
   onSubmit: () => void;
   isSubmitting: boolean;
   branches?: any;
   mode: "create" | "edit";
   errors?: FormErrors;
}

export const UserFormDialog = ({
   open,
   onOpenChange,
   formData,
   setFormData,
   roles,
   onSubmit,
   isSubmitting,
   branches,
   departments,
   mode,
   errors = {},
}: Props) => {
   const [localErrors, setLocalErrors] = React.useState<FormErrors>({});

   const handleChange = (field: keyof UserFormData, value: any) => {
      setFormData({ ...formData, [field]: value });
      if (localErrors[field]) {
         setLocalErrors((prev) => ({ ...prev, [field]: undefined }));
      }
   };

   React.useEffect(() => {
      if (open && mode === "create") {
         setFormData({
            fullName: "",
            username: "",
            email: "",
            phone: "",
            password: "",
            roleId: null,
            branchId: "",
            departmentId: "",
         });
         setLocalErrors({});
      }
   }, [open, mode, setFormData]);

   const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.username.trim()) newErrors.username = "Username is required";
      else if (formData.username.length < 3)
         newErrors.username = "Username must be at least 3 characters";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
         newErrors.email = "Please enter a valid email address";
      if (mode === "create" && !formData.password?.trim())
         newErrors.password = "Password is required";
      else if (formData.password && formData.password.length < 6)
         newErrors.password = "Password must be at least 6 characters";
      if (!formData.roleId) newErrors.roleId = "Role is required";

      setLocalErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = () => {
      if (validateForm()) onSubmit();
   };

   const allErrors = { ...localErrors, ...errors };
   const hasErrors = Object.keys(allErrors).length > 0;
   console.log("Roles in UserFormDialog:", roles);
   return (
      <Dialog
         open={open}
         onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-2xl max-h-[92vh] p-0 flex flex-col">
            <DialogHeader className="space-y-3 px-5 pt-5 pb-0 mb-0">
               <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                     <User className="h-4 w-4 text-primary" />
                  </div>
                  {mode === "create" ? "Create New User" : "Edit User"}
               </DialogTitle>
            </DialogHeader>

            <ScrollArea className="h-[85vh] overflow-auto border-t px-6">
               <div className="space-y-6 py-4 px-1">
                  {hasErrors && (
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                           Please fix the errors below before submitting.
                        </AlertDescription>
                     </Alert>
                  )}

                  {/* Personal Information Section */}
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label
                              htmlFor="username"
                              className="text-sm font-medium">
                              Username <span className="text-destructive">*</span>
                           </Label>
                           <Input
                              id="username"
                              placeholder="Enter username"
                              value={formData.username}
                              onChange={(e) => handleChange("username", e.target.value?.trim())}
                              className={cn(
                                 "transition-colors",
                                 allErrors.username &&
                                    "border-destructive focus-visible:ring-destructive"
                              )}
                           />
                           {allErrors.username && (
                              <p className="text-sm text-destructive">{allErrors.username}</p>
                           )}
                        </div>

                        <div className="space-y-2">
                           <Label
                              htmlFor="fullName"
                              className="text-sm font-medium">
                              Full Name <span className="text-destructive">*</span>
                           </Label>
                           <Input
                              id="fullName"
                              placeholder="Enter full name"
                              value={formData.fullName}
                              onChange={(e) => handleChange("fullName", e.target.value)}
                              className={cn(
                                 "transition-colors",
                                 allErrors.fullName &&
                                    "border-destructive focus-visible:ring-destructive"
                              )}
                           />
                           {allErrors.fullName && (
                              <p className="text-sm text-destructive">{allErrors.fullName}</p>
                           )}
                        </div>

                        <div className="space-y-2  col-span-2">
                           <Label
                              htmlFor="phone"
                              className="text-sm font-medium">
                              <Phone className="inline h-4 w-4 mr-1" />
                              Phone
                           </Label>
                           <Input
                              id="phone"
                              type="tel"
                              placeholder="Enter phone number"
                              value={formData.phone ?? ""}
                              onChange={(e) => handleChange("phone", e.target.value)}
                              className={cn(
                                 "transition-colors",
                                 allErrors.phone &&
                                    "border-destructive focus-visible:ring-destructive"
                              )}
                           />
                           {allErrors.phone && (
                              <p className="text-sm text-destructive">{allErrors.phone}</p>
                           )}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label
                           htmlFor="email"
                           className="text-sm font-medium flex items-end">
                           <Mail className="inline h-4 w-4 mr-0.5" />
                           Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                           id="email"
                           type="email"
                           placeholder="Enter email address"
                           value={formData.email}
                           onChange={(e) => handleChange("email", e.target.value)}
                           className={cn(
                              "transition-colors",
                              allErrors.email && "border-destructive focus-visible:ring-destructive"
                           )}
                        />
                        {allErrors.email && (
                           <p className="text-sm text-destructive">{allErrors.email}</p>
                        )}
                     </div>

                     {/* Password Field */}
                     {mode === "create" && (
                        <div className="space-y-2">
                           <Label
                              htmlFor="password"
                              className="text-sm font-medium">
                              Password <span className="text-destructive">*</span>
                           </Label>
                           <Input
                              id="password"
                              type="password"
                              placeholder="Enter password"
                              value={formData.password ?? ""}
                              onChange={(e) => handleChange("password", e.target.value)}
                              className={cn(
                                 "transition-colors",
                                 allErrors.password &&
                                    "border-destructive focus-visible:ring-destructive"
                              )}
                           />
                           {allErrors.password && (
                              <p className="text-sm text-destructive">{allErrors.password}</p>
                           )}
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label className="text-sm font-medium">
                           <Users className="inline h-3 w-3 mr-1" />
                           Department <span className="text-destructive">*</span>
                        </Label>
                        <SearchableDropdown
                           options={
                              Array.isArray(departments?.data)
                                 ? departments?.data.map(
                                      (dept: { name: string; id: number | string }) => ({
                                         value: dept.id,
                                         label: dept.name,
                                      })
                                   )
                                 : []
                           }
                           value={formData.departmentId ?? undefined}
                           onValueChange={(val) => handleChange("departmentId", val)}
                           placeholder="Select a department..."
                           searchPlaceholder="Search departments..."
                           emptyText="No departments found."
                           className={cn(allErrors.departmentId && "border-destructive")}
                        />
                        {allErrors.departmentId && (
                           <p className="text-sm text-destructive">{allErrors.departmentId}</p>
                        )}
                     </div>

                     <div className="space-y-2">
                        <Label className="text-sm font-medium">
                           <Building className="inline h-3 w-3 mr-1" />
                           Branch <span className="text-destructive">*</span>
                        </Label>
                        <SearchableDropdown
                           options={
                              Array.isArray(branches?.data)
                                 ? branches?.data.map(
                                      (branch: { name: string; id: number | string }) => ({
                                         value: branch.id,
                                         label: branch.name,
                                      })
                                   )
                                 : []
                           }
                           value={formData.branchId ?? undefined}
                           onValueChange={(val) => handleChange("branchId", val)}
                           placeholder="Select a branch..."
                           searchPlaceholder="Search branches..."
                           emptyText="No branches found."
                           className={cn(allErrors.branchId && "border-destructive")}
                        />
                        {allErrors.branchId && (
                           <p className="text-sm text-destructive">{allErrors.branchId}</p>
                        )}
                     </div>
                  </div>

                  {/* Role Section */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 pb-2 border-b">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                           Role Details
                        </h3>
                     </div>

                     <div className="space-y-2">
                        <Label className="text-sm font-medium">
                           <Shield className="inline h-3 w-3 mr-1" />
                           Role <span className="text-destructive">*</span>
                        </Label>
                        <SearchableDropdown
                           options={roles.map((role) => ({
                              value: role.id,
                              label: role?.name,
                           }))}
                           value={formData.roleId ?? undefined}
                           onValueChange={(val) => handleChange("roleId", val)}
                           placeholder="Select a role..."
                           searchPlaceholder="Search roles..."
                           emptyText="No roles found."
                           className={cn(allErrors.roleId && "border-destructive")}
                        />
                        {allErrors.roleId && (
                           <p className="text-sm text-destructive">{allErrors.roleId}</p>
                        )}
                     </div>
                  </div>
               </div>
            </ScrollArea>

            <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t px-5 pb-4">
               <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}>
                  Cancel
               </Button>
               <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="min-w-[100px]">
                  {isSubmitting ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {mode === "create" ? "Creating..." : "Updating..."}
                     </>
                  ) : (
                     <>{mode === "create" ? "Create User" : "Update User"}</>
                  )}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};
