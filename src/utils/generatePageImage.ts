import html2canvas from "html2canvas-pro";

/**
 * Converts a DOM element into a high-resolution, optimized JPEG for PDF.
 */
const generatePageImage = async (element: HTMLElement): Promise<string> => {
   if (!element) throw new Error("generatePageImage: No element provided.");

   const originalBg = element.style.backgroundColor;

   try {
      element.style.backgroundColor = "#ffff";

      // Higher scale for sharper text (3 ≈ 300 DPI on A4)
      const scale = Math.min(window.devicePixelRatio * 1.5, 3);

      const canvas = await html2canvas(element, {
         scale,
         useCORS: true,
         backgroundColor: "#ffff",
         width: element.scrollWidth,
         height: element.scrollHeight,
         scrollX: 0,
         scrollY: 0,
         windowWidth: element.scrollWidth,
         windowHeight: element.scrollHeight,
         removeContainer: true,
      });

      // High-quality JPEG (90%)
      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      return imgData;
   } finally {
      element.style.backgroundColor = originalBg;
   }
};

export default generatePageImage;
