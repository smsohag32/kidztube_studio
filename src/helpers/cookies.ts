import { jwtDecode } from "jwt-decode";
export const setCookie = (name: string, value: string, days: number = 1) => {
   const expirationDate = new Date();
   expirationDate.setTime(expirationDate.getTime() + days * 24 * 60 * 60 * 1000);
   document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
};

export const deleteCookie = (name: string) => {
   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const getCookie = (name: string): string | null => {
   if (typeof document === "undefined") {
      return null;
   }
   const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name))
      ?.split("=")[1];
   return cookieValue ? decodeURIComponent(cookieValue) : null;
};

export const isTokenExpired = (token: string): boolean => {
   try {
      const decoded: { exp: number } = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
   } catch {
      return true;
   }
};
