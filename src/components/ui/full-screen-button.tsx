"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";

interface FullScreenButtonProps {
   targetRef: React.RefObject<HTMLElement>;
   size?: "sm" | "lg" | "default" | "icon";
   className?: string;
}

const FullScreenButton: React.FC<FullScreenButtonProps> = ({
   targetRef,
   size = "sm",
   className = "",
}) => {
   const [isFullScreen, setIsFullScreen] = useState(false);

   const toggleFullScreen = () => {
      if (!targetRef.current) return;

      if (document.fullscreenElement === targetRef.current) {
         document.exitFullscreen();
      } else {
         targetRef.current.requestFullscreen();
      }
   };

   React.useEffect(() => {
      const handler = () => {
         setIsFullScreen(document.fullscreenElement === targetRef.current);
      };
      document.addEventListener("fullscreenchange", handler);
      return () => document.removeEventListener("fullscreenchange", handler);
   }, [targetRef]);

   return (
      <Button
         size={size}
         variant={"ghost"}
         onClick={toggleFullScreen}
         className={` ${className} `}>
         {isFullScreen ? (
            <>
               <Minimize className="h-4 w-4" />
            </>
         ) : (
            <>
               <Maximize className="h-4 w-4" />
            </>
         )}
      </Button>
   );
};

export default FullScreenButton;
