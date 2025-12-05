"use client";

import * as React from "react";
import AsyncSelect from "react-select/async";
import type { StylesConfig, GroupBase } from "react-select";

export interface Option {
   value: string | number;
   label: string;
   [key: string]: any;
}

interface AsyncSearchSelectProps {
   value?: string | number;
   onChange: (val: string | number, selected?: Option) => void;
   fetcher: (query: string) => Promise<Option[]>;
   placeholder?: string;
   disabled?: boolean;
   minSearchLength?: number;
   className?: string;
   emptyMessage?: string;
}

/**
 * Async searchable select styled to match Shadcn inputs
 * Works with Tailwind theme colors (OKLCH or HSL)
 */
export function AsyncSearchSelect({

   onChange,
   fetcher,
   placeholder = "Search...",
   disabled = false,
   minSearchLength = 2,
   className = "",
   emptyMessage = "No results found.",
}: AsyncSearchSelectProps) {
   const [selectedOption, setSelectedOption] = React.useState<Option | null>(null);

   // ✅ Use CSS variables directly, not "hsl(var())"
   const getCssVar = (token: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(token)?.trim() || "transparent";

   const customStyles: StylesConfig<Option, false, GroupBase<Option>> = {
      control: (base, state) => ({
         ...base,
         minHeight: "40px",
         borderRadius: "var(--radius-md)",
         borderWidth: "1px",
         borderColor: state.isFocused ? getCssVar("--ring") : getCssVar("--input"),
         backgroundColor: getCssVar("--background"),
         boxShadow: state.isFocused ? `0 0 0 2px ${getCssVar("--ring")}` : "none",
         transition: "border-color 0.2s ease, box-shadow 0.2s ease",
         paddingLeft: "4px",
         paddingRight: "4px",
         "&:hover": {
            borderColor: getCssVar("--ring"),
         },
         opacity: state.isDisabled ? 0.6 : 1,
         cursor: state.isDisabled ? "not-allowed" : "default",
      }),

      valueContainer: (base) => ({
         ...base,
         padding: "0 6px",
      }),

      input: (base) => ({
         ...base,
         color: getCssVar("--foreground"),
         fontSize: "0.875rem",
         margin: 0,
         padding: 0,
      }),

      placeholder: (base) => ({
         ...base,
         color: getCssVar("--muted-foreground"),
         fontSize: "0.875rem",
      }),

      singleValue: (base) => ({
         ...base,
         color: getCssVar("--foreground"),
         fontSize: "0.875rem",
      }),

      menu: (base) => ({
         ...base,
         backgroundColor: getCssVar("--popover"),
         color: getCssVar("--popover-foreground"),
         borderRadius: "var(--radius-md)",
         border: `1px solid ${getCssVar("--border")}`,
         boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
         marginTop: "4px",
         overflow: "hidden",
      }),

      menuList: (base) => ({
         ...base,
         padding: "4px",
         maxHeight: "280px",
      }),

      option: (base, state) => ({
         ...base,
         backgroundColor: state.isSelected
            ? getCssVar("--accent")
            : state.isFocused
            ? `${getCssVar("--accent")}55` // 55 = semi transparent
            : "transparent",
         color: state.isSelected ? getCssVar("--accent-foreground") : getCssVar("--foreground"),
         borderRadius: "0.25rem",
         fontSize: "0.875rem",
         padding: "8px 12px",
         cursor: "pointer",
         transition: "background-color 0.15s ease, color 0.15s ease",
      }),

      loadingMessage: (base) => ({
         ...base,
         color: getCssVar("--muted-foreground"),
         fontSize: "0.875rem",
         padding: "12px",
      }),

      noOptionsMessage: (base) => ({
         ...base,
         color: getCssVar("--muted-foreground"),
         fontSize: "0.875rem",
         padding: "12px",
      }),

      indicatorSeparator: () => ({
         display: "none",
      }),

      dropdownIndicator: (base, state) => ({
         ...base,
         color: state.isFocused ? getCssVar("--foreground") : getCssVar("--muted-foreground"),
         padding: "6px",
         transition: "color 0.2s ease",
         cursor: "pointer",
      }),

      clearIndicator: (base) => ({
         ...base,
         color: getCssVar("--muted-foreground"),
         padding: "6px",
         transition: "color 0.2s ease",
         "&:hover": {
            color: getCssVar("--foreground"),
         },
      }),
   };

   const loadOptions = React.useCallback(
      (inputValue: string, callback: (options: Option[]) => void) => {
         if (!inputValue || inputValue.length < minSearchLength) {
            callback([]);
            return;
         }

         fetcher(inputValue)
            .then((options) => callback(options || []))
            .catch((err) => {
               console.error("Error fetching options:", err);
               callback([]);
            });
      },
      [fetcher, minSearchLength]
   );

   const handleChange = (option: Option | null) => {
      setSelectedOption(option);
      if (option) {
         onChange(option.value, option);
      } else {
         onChange("", undefined);
      }
   };

   return (
      <AsyncSelect<Option, false>
         cacheOptions
         defaultOptions
         value={selectedOption}
         loadOptions={loadOptions}
         onChange={handleChange}
         placeholder={placeholder}
         isDisabled={disabled}
         isClearable
         styles={customStyles}
         className={className}
         loadingMessage={() => "Searching..."}
         noOptionsMessage={({ inputValue }) =>
            !inputValue || inputValue.length < minSearchLength
               ? `Type at least ${minSearchLength} characters to search`
               : emptyMessage
         }
         components={{
            IndicatorSeparator: () => null,
         }}
      />
   );
}
