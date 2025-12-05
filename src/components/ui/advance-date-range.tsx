"use client";

import { type FC, useState } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRange {
   from: Date;
   to: Date;
}

interface Preset {
   name: string;
   label: string;
   getRange: () => DateRange;
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
const endOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);

const getQuarter = (d: Date) => Math.floor(d.getMonth() / 3);
const startOfQuarter = (d: Date) => {
   const q = getQuarter(d);
   return new Date(d.getFullYear(), q * 3, 1, 0, 0, 0, 0);
};
const endOfQuarter = (d: Date) => {
   const q = getQuarter(d);
   return new Date(d.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
};

const PRESETS: Preset[] = [
   {
      name: "today",
      label: "Today",
      getRange: () => {
         const d = new Date();
         return {
            from: new Date(d.setHours(0, 0, 0, 0)),
            to: new Date(d.setHours(23, 59, 59, 999)),
         };
      },
   },
   {
      name: "thisMonth",
      label: "This Month",
      getRange: () => {
         const now = new Date();
         return { from: startOfMonth(now), to: endOfMonth(now) };
      },
   },
   {
      name: "lastMonth",
      label: "Last Month",
      getRange: () => {
         const now = new Date();
         const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
         return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      },
   },
   {
      name: "thisYear",
      label: "This Year",
      getRange: () => {
         const now = new Date();
         return { from: startOfYear(now), to: endOfYear(now) };
      },
   },
   {
      name: "lastYear",
      label: "Last Year",
      getRange: () => {
         const now = new Date();
         const lastYear = new Date(now.getFullYear() - 1, 0, 1);
         return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
      },
   },
   {
      name: "thisQuarter",
      label: "This Quarter",
      getRange: () => {
         const now = new Date();
         return { from: startOfQuarter(now), to: endOfQuarter(now) };
      },
   },
   {
      name: "lastQuarter",
      label: "Last Quarter",
      getRange: () => {
         const now = new Date();
         const lastQ = new Date(now.getFullYear(), now.getMonth() - 3, 1);
         return { from: startOfQuarter(lastQ), to: endOfQuarter(lastQ) };
      },
   },
   {
      name: "nextQuarter",
      label: "Next Quarter",
      getRange: () => {
         const now = new Date();
         const nextQ = new Date(now.getFullYear(), now.getMonth() + 3, 1);
         return { from: startOfQuarter(nextQ), to: endOfQuarter(nextQ) };
      },
   },
];

export const AdvancedDateRangePicker: FC<{
   onChange?: (range: DateRange) => void;
}> = ({ onChange }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [range, setRange] = useState<DateRange>(PRESETS[0].getRange());
   const [selectedPreset, setSelectedPreset] = useState<string>("today");

   const handlePreset = (preset: Preset) => {
      const newRange = preset.getRange();
      setRange(newRange);
      setSelectedPreset(preset.name);
      onChange?.(newRange);
      setIsOpen(false);
   };

   const formatDate = (d: Date) =>
      d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

   return (
      <Popover
         open={isOpen}
         onOpenChange={setIsOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               size="lg">
               <div className="flex items-center gap-2">
                  <span>
                     {formatDate(range.from)} - {formatDate(range.to)}
                  </span>
                  {isOpen ? (
                     <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                     <ChevronDownIcon className="w-4 h-4" />
                  )}
               </div>
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-[300px] p-4">
            <div className="space-y-2">
               {PRESETS.map((preset) => (
                  <Button
                     key={preset.name}
                     variant="ghost"
                     className="w-full flex justify-start gap-2"
                     onClick={() => handlePreset(preset)}>
                     <CheckIcon
                        className={cn(
                           "w-4 h-4 opacity-0",
                           selectedPreset === preset.name && "opacity-70"
                        )}
                     />
                     {preset.label}
                  </Button>
               ))}
            </div>
            <div className="mt-4">
               <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={range}
                  onSelect={(value: { from?: Date; to?: Date } | undefined) => {
                     if (value?.from && value?.to) {
                        setRange({ from: value.from, to: value.to });
                        setSelectedPreset("");
                        onChange?.({ from: value.from, to: value.to });
                     }
                  }}
               />
            </div>
         </PopoverContent>
      </Popover>
   );
};
