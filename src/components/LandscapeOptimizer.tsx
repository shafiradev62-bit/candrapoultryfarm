import { useEffect } from "react";

/**
 * LandscapeOptimizer Component
 * Handles dynamic viewport adjustments and CSS class management for landscape mode
 */
export function LandscapeOptimizer() {
  useEffect(() => {
    const handleOrientationAndResize = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const isSmallHeight = window.innerHeight <= 768;
      const root = document.getElementById("root");
      
      if (root) {
        if (isLandscape && isSmallHeight) {
          root.classList.add("landscape-mode");
          document.body.classList.add("landscape-mode");
          
          // Add specific height classes for more granular control
          if (window.innerHeight <= 400) {
            root.classList.add("landscape-xs");
          } else if (window.innerHeight <= 500) {
            root.classList.add("landscape-sm");
          } else {
            root.classList.add("landscape-md");
          }
        } else {
          root.classList.remove("landscape-mode", "landscape-xs", "landscape-sm", "landscape-md");
          document.body.classList.remove("landscape-mode");
        }
      }
      
      // Force reflow to ensure styles are applied
      if (root) {
        void root.offsetHeight;
      }
    };

    // Run on mount
    handleOrientationAndResize();

    // Listen for orientation and resize changes
    window.addEventListener("orientationchange", handleOrientationAndResize);
    window.addEventListener("resize", handleOrientationAndResize);
    
    // Also listen for screen orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener("change", handleOrientationAndResize);
    }

    return () => {
      window.removeEventListener("orientationchange", handleOrientationAndResize);
      window.removeEventListener("resize", handleOrientationAndResize);
      if (screen.orientation) {
        screen.orientation.removeEventListener("change", handleOrientationAndResize);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
