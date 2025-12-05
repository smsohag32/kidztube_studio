import React, { useEffect, useState } from "react";

import { storageKeys } from "@/lib/constants/keys";
import { ThemeProviderContext } from "./ThemeProviderContext";

type Theme = "dark" | "light" | "system";

type ThemeProvider = {
   children: React.ReactNode;
   defaultTheme?: Theme;
   storageKey?: string;
};

export default function ThemeProvider({
   children,
   defaultTheme = "system",
   storageKey = storageKeys.theme,
   ...properties
}: Readonly<ThemeProvider>) {
   const [theme, setTheme] = useState<Theme>(() => {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      return storedTheme ?? defaultTheme;
   });

   useEffect(() => {
      const root = globalThis.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
         const systemTheme = globalThis.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

         root.classList.add(systemTheme);
         return;
      }

      root.classList.add(theme);
   }, [theme]);

   const value = {
      theme,
      setTheme: (theme: Theme) => {
         localStorage.setItem(storageKey, theme);
         setTheme(theme);
      },
   };

   return (
      <ThemeProviderContext.Provider
         {...properties}
         value={value}>
         {children}
      </ThemeProviderContext.Provider>
   );
}
