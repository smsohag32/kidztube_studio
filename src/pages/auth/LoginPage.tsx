
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
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-background overflow-hidden">
         {/* Ambient Background Glows */}
         <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
         <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

         <Card className="w-full max-w-[440px] rounded-3xl border border-border/80 shadow-2xl bg-card/95 backdrop-blur-xl p-6 sm:p-8 space-y-6 relative z-10">
            {/* Header / Brand */}
            <div className="space-y-3 text-center">
               <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/25 shadow-xs mx-auto">
                  <Logo className="w-12 h-12 object-contain" />
               </div>

               <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                     KidzTube Studio
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                     Enter your credentials to access the creator management portal.
                  </p>
               </div>
            </div>

            <Separator className="opacity-50" />

            {/* Login Form */}
            <form
               onSubmit={handleSubmit(onSubmit)}
               className="space-y-4">
               {/* Email or Username */}
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground" htmlFor="username">
                     Email or Username
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        {username.includes("@") ? (
                           <Mail className="h-4 w-4" />
                        ) : (
                           <User className="h-4 w-4" />
                        )}
                     </div>
                     <Input
                        id="username"
                        type="text"
                        placeholder="creator@kidztube.com"
                        className={`pl-10 text-xs sm:text-sm h-11 rounded-xl ${
                           errors.username ? "border-destructive ring-1 ring-destructive" : ""
                        }`}
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
                     <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                  )}
               </div>

               {/* Password */}
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground" htmlFor="password">
                     Password
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="h-4 w-4" />
                     </div>
                     <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 text-xs sm:text-sm h-11 rounded-xl ${
                           errors.password ? "border-destructive ring-1 ring-destructive" : ""
                        }`}
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
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground">
                        {showPassword ? (
                           <EyeOff className="h-4 w-4" />
                        ) : (
                           <Eye className="h-4 w-4" />
                        )}
                     </button>
                  </div>
                  {errors.password && (
                     <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                  )}
               </div>

               {/* Remember Me */}
               <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                     <input
                        type="checkbox"
                        {...register("rememberMe")}
                        className="rounded border-border text-primary focus:ring-primary"
                     />
                     <span>Remember this device</span>
                  </label>
                  <a href="#" className="text-primary hover:underline font-medium">
                     Forgot password?
                  </a>
               </div>

               <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                  disabled={isLoading}>
                  {isLoading ? "Signing in to Studio..." : "Sign in to Studio"}
               </Button>
            </form>

            {/* Footer Notice */}
            <div className="pt-2 text-center border-t border-border/40">
               <p className="text-xs text-muted-foreground">
                  Safe & verified streaming platform for kids.
               </p>
               <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Copyright &copy; {new Date().getFullYear()} KidzTube Studio.
               </p>
            </div>
         </Card>
      </div>
   );
}

