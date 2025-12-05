import axios from "axios";

export const loginApi = async (credentials: Record<string, any>) => {
   try {
      const response = await axios.post(
         `${import.meta.env.VITE_BASE_URL}/api/v1/auth/users/login`,
         credentials
      );
      return response.data;
   } catch (error: any) {
      if (axios.isAxiosError(error)) {
         // Try to grab first error message
         const message = error.response?.data?.errors?.[0]?.message || "Login failed";

         throw new Error(message);
      }

      // Non-axios error
      throw new Error("Unexpected error occurred");
   }
};
