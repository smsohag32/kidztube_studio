"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface Option {
   value: string | number;
   label: string;
   disabled?: boolean;
}

interface SearchableDropdownProps {
   options: Option[];
   value?: string | number | (string | number)[];
   onValueChange: (value: string | number | (string | number)[]) => void;
   placeholder?: string;
   searchPlaceholder?: string;
   emptyText?: string;
   multiple?: boolean;
   disabled?: boolean;
   className?: string;
   maxDisplayItems?: number;
}

export function SearchableDropdown({
   options,
   value,
   onValueChange,
   placeholder = "Select option...",
   searchPlaceholder = "Search options...",
   emptyText = "No options found.",
   multiple = false,
   disabled = false,
   className,
   maxDisplayItems = 3,
}: SearchableDropdownProps) {
   const [open, setOpen] = React.useState(false);
   const [searchValue, setSearchValue] = React.useState("");
   console.log("SearchableDropdown rendered with options:", options);
   const selectedValues = React.useMemo(() => {
      if (multiple) {
         return Array.isArray(value) ? value : [];
      }
      return value !== undefined ? [value] : [];
   }, [value, multiple]);

   const selectedOptions = React.useMemo(() => {
      return options.filter((option) => selectedValues.includes(option.value));
   }, [options, selectedValues]);

   const filteredOptions = React.useMemo(() => {
      if (!searchValue) return options;
      return options.filter((option) =>
         option.label.toLowerCase().includes(searchValue.toLowerCase())
      );
   }, [options, searchValue]);

   const handleSelect = (selectedValue: string | number) => {
      console.log("Single select value:", selectedValue);
      if (multiple) {
         const currentValues = Array.isArray(value) ? value : [];
         const newValues = currentValues.includes(selectedValue)
            ? currentValues.filter((v) => v !== selectedValue)
            : [...currentValues, selectedValue];
         onValueChange(newValues);
      } else {
         onValueChange(selectedValue);
         setOpen(false);
      }
      setSearchValue("");
   };

   const handleRemove = (valueToRemove: string | number) => {
      if (multiple) {
         const currentValues = Array.isArray(value) ? value : [];
         const newValues = currentValues.filter((v) => v !== valueToRemove);
         onValueChange(newValues);
      } else {
         onValueChange("");
      }
   };

   const displayText = React.useMemo(() => {
      if (selectedOptions.length === 0) return placeholder;

      if (multiple) {
         if (selectedOptions.length <= maxDisplayItems) {
            return null; // Will show badges instead
         }
         return `${selectedOptions.length} items selected`;
      }

      return selectedOptions[0]?.label;
   }, [selectedOptions, placeholder, multiple, maxDisplayItems]);

   return (
      <Popover
         open={open}
         onOpenChange={setOpen}
         modal={true}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className={cn(
                  "w-full justify-between  h-auto",
                  !selectedValues.length && "text-muted-foreground",
                  className
               )}
               disabled={disabled}>
               <div className="flex flex-wrap gap-1 flex-1">
                  {multiple &&
                  selectedOptions.length > 0 &&
                  selectedOptions.length <= maxDisplayItems ? (
                     selectedOptions.map((option) => (
                        <Badge
                           key={option.value}
                           variant="secondary"
                           className="text-xs">
                           {option.label}
                           <button
                              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onKeyDown={(e) => {
                                 if (e.key === "Enter") {
                                    handleRemove(option.value);
                                 }
                              }}
                              onMouseDown={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                              }}
                              onClick={() => handleRemove(option.value)}>
                              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                           </button>
                        </Badge>
                     ))
                  ) : (
                     <span className="truncate">{displayText}</span>
                  )}
               </div>
               <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
         </PopoverTrigger>
         <PopoverContent
            className="w-[var(--radix-popover-trigger-width)]     overflow-auto p-0"
            align="start">
            <Command>
               <div className="flex items-center border-b px-3">
                  <CommandInput
                     placeholder={searchPlaceholder}
                     value={searchValue}
                     onValueChange={setSearchValue}
                     className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  />
               </div>
               <CommandList>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  <CommandGroup>
                     {filteredOptions.map((option) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                           <CommandItem
                              key={option.value}
                              value={option.label}
                              onSelect={() => handleSelect(option.value)}
                              disabled={option.disabled}
                              className="flex items-center gap-2 cursor-pointer">
                              <div
                                 className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected
                                       ? "bg-primary text-primary-foreground"
                                       : "opacity-50 [&_svg]:invisible"
                                 )}>
                                 <Check className="h-3 w-3" />
                              </div>
                              <span className="flex-1">{option.label}</span>
                           </CommandItem>
                        );
                     })}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   );
}
