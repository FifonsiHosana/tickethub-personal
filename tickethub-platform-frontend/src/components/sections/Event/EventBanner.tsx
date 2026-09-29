import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Event } from "@/types/event.types";

type Props = { bannerImage: string; event: Event; bgColor: string };
export default function EventBanner({ bannerImage, event }: Props) {
  // State to track whether the lightbox modal is open
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Close viewer when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsViewerOpen(false);
    };

    if (isViewerOpen) {
      document.body.style.overflow = "hidden"; // Prevent scrolling when open
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen]);

  return (
    <>
      {/* Banner Container */}
      <div className="hidden lg:block shrink-0 order-2 w-full max-w-lg">
        {/* <div
          onClick={() => bannerImage && setIsViewerOpen(true)}
          style={{ backgroundColor: `${bgColor}33` }}
          className={`relative p-3 w-full h-80 xl:h-96 rounded-4xl overflow-hidden transition-colors duration-500 group ${
            bannerImage ? "cursor-pointer" : "cursor-default"
          }`}
        > */}
        <div
          onClick={() => bannerImage && setIsViewerOpen(true)}
          className={`flex justify-end relative p-3 w-full h-full group ${
            bannerImage ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {bannerImage ? (
            <>
              <img
                src={bannerImage}
                alt={event.title}
                crossOrigin="anonymous"
                className="  max-h-100  object-contain object-center rounded-2xl transition-transform duration-400 group-hover:scale-[1.02]"
              />

              {/* Hover overlay hint */}
              {/* <div className="absolute inset-3 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-3 bg-white/90 backdrop-blur-md rounded-full text-stone-900 shadow-md">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div> */}
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-neutral-400 bg-neutral-100/80 rounded-4xl text-sm font-medium">
              No Banner Available
            </div>
          )}
        </div>
      </div>
      {/* </div> */}

      {/* --- Image Viewer Modal --- */}
      {isViewerOpen && bannerImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsViewerOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsViewerOpen(false)}
            aria-label="Close image viewer"
            className="absolute top-5 right-5 z-10 p-2.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Expanded Image Container */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent click inside image container from closing
          >
            <img
              src={bannerImage}
              alt={event.title}
              className="max-w-full max-h-[85vh] object-contain rounded-xl select-none"
            />
          </div>
        </div>
      )}
    </>
  );
}
