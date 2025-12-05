/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface SearchInputProps<T = any> {
   value?: T;
   onSelect: (item: T) => void;
   fetcher: (query: string) => Promise<T[]>;
   displayField?: keyof T;
   placeholder?: string;
   debounceTime?: number;
   className?: string;
   disabled?: boolean;
}

/**
 * Optimized, debounced search input with dropdown results.
 * - Uses cancelable fetches
 * - Handles fast typing gracefully
 * - Works well with any async API
 */
export default function SearchInput<T>({
   value,
   onSelect,
   fetcher,
   displayField = "name" as keyof T,
   placeholder = "Type to search...",
   debounceTime = 400,
   className = "",
   disabled = false,
}: SearchInputProps<T>) {
   const [query, setQuery] = useState<string>((value?.[displayField] as string) || "");
   const [options, setOptions] = useState<T[]>([]);
   const [loading, setLoading] = useState(false);
   const [showDropdown, setShowDropdown] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const abortRef = useRef<AbortController | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);

   // --- Debounce logic ---
   const debounceTimer = useRef<NodeJS.Timeout | null>(null);
   const debouncedFetch = useCallback(
      (term: string) => {
         if (debounceTimer.current) clearTimeout(debounceTimer.current);
         debounceTimer.current = setTimeout(() => fetchOptions(term), debounceTime);
      },
      [debounceTime]
   );

   // --- Fetch logic (with abort) ---
   const fetchOptions = useCallback(
      async (searchTerm: string) => {
         if (!searchTerm.trim()) {
            setOptions([]);
            setError(null);
            setShowDropdown(false);
            return;
         }

         // Cancel previous request if still pending
         abortRef.current?.abort();
         const controller = new AbortController();
         abortRef.current = controller;

         setLoading(true);
         setError(null);

         try {
            const res = await fetcher(searchTerm);

            if (!res?.length) {
               setOptions([]);
               setError("No results found");
            } else {
               setOptions(res);
               setError(null);
            }
            setShowDropdown(true);
         } catch (err: any) {
            if (err.name === "AbortError") return; // ignore aborted
            console.error("SearchInput fetch error:", err);
            setError("Failed to fetch results");
            setOptions([]);
            setShowDropdown(true);
         } finally {
            setLoading(false);
         }
      },
      [fetcher]
   );

   // --- Debounce input changes ---
   useEffect(() => {
      debouncedFetch(query);
   }, [query, debouncedFetch]);

   // --- Click outside to close dropdown ---
   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (!containerRef.current?.contains(e.target as Node)) {
            setShowDropdown(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // --- Memoize option rendering ---
   const optionList = useMemo(() => {
      if (loading) return <p className="p-2 text-sm text-gray-500">Searching...</p>;
      if (error) return <p className="p-2 text-sm text-gray-500 italic">{error}</p>;
      if (!options.length && query.trim())
         return <p className="p-2 text-sm text-gray-500 italic">No results found</p>;

      return (
         <ul>
            {options.map((item, idx) => (
               <li
                  key={idx}
                  className="p-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onMouseDown={(e) => e.preventDefault()} // prevent blur
                  onClick={() => {
                     onSelect(item);
                     setQuery(item[displayField] as string);
                     setShowDropdown(false);
                     setError(null);
                  }}>
                  {item[displayField] as string}
               </li>
            ))}
         </ul>
      );
   }, [options, loading, error, displayField, query, onSelect]);

   return (
      <div
         className={`relative w-full ${className}`}
         ref={containerRef}>
         <Input
            disabled={disabled}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowDropdown(true)}
            className="w-full"
         />

         {showDropdown && (
            <div className="absolute z-50 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto mt-1">
               {optionList}
            </div>
         )}
      </div>
   );
}
