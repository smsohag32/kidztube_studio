
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { loginUser } from "@/redux-store/slices/authSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux-store";
import { displayErrors } from "@/helpers/error";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import Logo from "@/assets/logo/Logo";
// Define form data type
interface FormData {
   username: string;
   password: string;
   rememberMe: boolean;
}

export default function LoginPage() {
   const dispatch = useDispatch<AppDispatch>();
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const navigate = useNavigate();
   // useForm hook from react-hook-form
   const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
   } = useForm<FormData>({
      mode: "onChange",
      defaultValues: {
         username: "",
         password: "",
         rememberMe: false,
      },
   });

   const onSubmit = async (data: FormData) => {
      setIsLoading(true);
      try {
         await new Promise((resolve) => setTimeout(resolve, 1500));
         const res = await dispatch(
            loginUser({ username: data.username, password: data.password })
         ).unwrap();
         if (!res.success) {
            throw new Error(res.message || "Login failed");
         }

         console.log(res);
         navigate("/dashboard", { replace: true });
         toast.success("Login successful!");
      } catch (error: string | any) {
         console.log(error);
         displayErrors("", error);
      } finally {
         setIsLoading(false);
         // navigate("/dashboard", { replace: true });
      }
   };

   const username = watch("username");

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
         <Card className="w-full py-10 px-6 max-w-[480px]">
            <CardHeader className="space-y-1 ">
               <div className="  gap-2 mb-4">
                  <div>
                     <Logo className="w-14" />
                  </div>
               </div>
               <Separator />
               <CardTitle className="text-2xl py-2 text-gray-700 font-bold">
                  Access your account{" "}
               </CardTitle>
            </CardHeader>
            <CardContent>
               <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4">
                  {/* Email or Username */}
                  <div className="space-y-2">
                     {/* <Label htmlFor="username">Email or Username</Label> */}
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           {username.includes("@") ? (
                              <Mail className="h-4 w-4 text-muted-foreground" />
                           ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                           )}
                        </div>
                        <Input
                           id="username"
                           type="text"
                           placeholder="Enter email or username"
                           className={`pl-10 ${errors.username ? "border-destructive" : ""}`}
                           {...register("username", {
                              required: "Email or username is required",
                              validate: (value) => {
                                 const trimmedValue = value.trim();
                                 if (trimmedValue.includes("@")) {
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    return (
                                       emailRegex.test(trimmedValue) ||
                                       "Please enter a valid email address"
                                    );
                                 } else {
                                    return (
                                       trimmedValue.length >= 3 ||
                                       "Username must be at least 3 characters"
                                    );
                                 }
                              },
                           })}
                           onChange={(e) => {
                              const noSpaces = e.target.value.replace(/\s+/g, "");
                              e.target.value = noSpaces;
                           }}
                        />
                     </div>
                     {errors.username && (
                        <p className="text-sm text-destructive">{errors.username.message}</p>
                     )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                     {/* <Label htmlFor="password">Password</Label> */}
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                           id="password"
                           type={showPassword ? "text" : "password"}
                           placeholder="Enter your password"
                           className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                           {...register("password", {
                              required: "Password is required",
                              minLength: {
                                 value: 6,
                                 message: "Password must be at least 6 characters",
                              },
                           })}
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute inset-y-0 right-0 pr-3 flex items-center">
                           {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                           ) : (
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                           )}
                        </button>
                     </div>
                     {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                     )}
                  </div>

                  {/* Remember Me */}
                  {/* <div className="flex items-center space-x-2 pb-2">
                     <Checkbox
                        id="rememberMe"
                        {...register("rememberMe")}
                     />
                     <Label
                        htmlFor="rememberMe"
                        className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Remember me
                     </Label>
                  </div> */}

                  <Button
                     type="submit"
                     size={"lg"}
                     className="w-full mt-2"
                     disabled={isLoading}>
                     {isLoading ? "Logging in..." : "Login"}
                  </Button>
               </form>
               <div className="pt-2">
                  <p className="text-gray-700 text-sm text-center mt-4">
                     Copyright &copy; {new Date().getFullYear()}{" "}
                     <a
                        href=""
                        className="text-blue-600 hover:underline transition-all duration-300 font-semibold">
                        Project 2morrow Software Ltd.{" "}
                     </a>
                     <br /> All rights reserved.
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
