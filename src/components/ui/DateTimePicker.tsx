import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface DateTimePickerProps {
   value: string;
   onChange: (value: string) => void;
}

export const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
   const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
   const [time, setTime] = useState(value ? new Date(value).toISOString().slice(11, 16) : "");

   const now = new Date();

   const handleDateChange = (d: Date | undefined) => {
      if (!d) return;
      setDate(d);

      // If selected date is today and time is before now, reset time
      let newTime = time;
      if (
         d.toDateString() === now.toDateString() &&
         time &&
         Number(time.split(":")[0]) < now.getHours()
      ) {
         newTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
         setTime(newTime);
      }

      if (d && newTime) {
         const [hours, minutes] = newTime.split(":");
         const combined = new Date(d);
         combined.setHours(Number(hours), Number(minutes));
         onChange(combined.toISOString());
      }
   };

   const handleTimeChange = (t: string) => {
      if (!date) return;

      const [hours, minutes] = t.split(":").map(Number);

      // Prevent selecting past time if date is today
      if (date.toDateString() === now.toDateString()) {
         if (hours < now.getHours() || (hours === now.getHours() && minutes < now.getMinutes())) {
            return; // ignore invalid time
         }
      }

      setTime(t);
      const combined = new Date(date);
      combined.setHours(hours, minutes);
      onChange(combined.toISOString());
   };

   return (
      <div className="flex flex-col sm:flex-row items-center gap-2">
         <div className="w-full">
            <Popover>
               <PopoverTrigger asChild>
                  <Button
                     variant="outline"
                     className="w-full justify-start text-left font-normal">
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
               </PopoverTrigger>
               <PopoverContent
                  className="p-0"
                  align={"start"}
                  side="top">
                  <Calendar
                     mode="single"
                     footer
                     className="w-full"
                     captionLayout="dropdown"
                     selected={date}
                     onSelect={handleDateChange}
                     initialFocus
                     disabled={(d) => d < new Date(now.setHours(0, 0, 0, 0))} // disable past dates
                  />
               </PopoverContent>
            </Popover>
         </div>

         <div className="relative w-full">
            <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
               type="time"
               value={time}
               onChange={(e) => handleTimeChange(e.target.value)}
               className="pl-8"
            />
         </div>
      </div>
   );
};
