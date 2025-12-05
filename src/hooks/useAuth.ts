import type { RootState } from "@/redux-store";
import { useSelector } from "react-redux";

export const useAuth = () => {
   const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);
   return {
      user,
      token,
      isLoading,
      error,
      isAuthenticated: !!token,
      hasError: !!error,
   };
};
