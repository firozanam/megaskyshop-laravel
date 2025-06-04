import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function VideoSection({ videoUrl }) {
  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    setEmbedUrl(getYouTubeEmbedUrl(videoUrl));
  }, [videoUrl]);

  if (!embedUrl) {
    return null;
  }

  return (
    <section className="my-8 sm:my-12 md:my-16 flex flex-col items-center px-4 sm:px-6 md:px-8">
      <div className="border-2 sm:border-3 md:border-4 border-[hsl(var(--primary))] p-3 sm:p-4 md:p-6 rounded-md sm:rounded-lg w-full max-w-[1152px] bg-card shadow-md sm:shadow-lg">
        <div className="aspect-w-16 aspect-h-9 rounded-md sm:rounded-lg md:rounded-xl overflow-hidden">
          <iframe
            src={embedUrl}
            title="Product Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
      
      <p className="mt-6 sm:mt-8 text-center text-sm sm:text-base md:text-lg px-2 sm:px-4 max-w-[1152px] text-muted-foreground leading-relaxed sm:leading-relaxed">
        আমরা সারা বাংলাদেশ ফ্রী হোম ডেলিভারী দিয়ে থাকি। আমাদের কোন ডেলিভারী চার্জ নেই। 
        <br className="hidden sm:block" />
        সারা বাংলাদেশের যে কোন জায়গায় ক্যাশ অন ডেলিভারির মাধ্যমে সেভাবেই ডেলিভারি করা হয়।
      </p>

      <div className="flex justify-center mt-6 sm:mt-8">
        <Button
          asChild
          variant="destructive"
          size="lg"
          className="text-base sm:text-lg py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-10 font-semibold relative group overflow-hidden hover:scale-105 transition-transform duration-300"
        >
          <Link href="#order-form" className="flex items-center">
            <span className="relative z-10">অর্ডার করতে চাই</span>
            <svg
              aria-hidden="true"
              className="e-font-icon-svg e-far-hand-point-down ml-1.5 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:animate-bounce"
              viewBox="0 0 448 512"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M188.8 512c45.616 0 83.2-37.765 83.2-83.2v-35.647a93.148 93.148 0 0 0 22.064-7.929c22.006 2.507 44.978-3.503 62.791-15.985C409.342 368.1 448 331.841 448 269.299V248c0-60.063-40-98.512-40-127.2v-2.679c4.952-5.747 8-13.536 8-22.12V32c0-17.673-12.894-32-28.8-32H156.8C140.894 0 128 14.327 128 32v64c0 8.584 3.048 16.373 8 22.12v2.679c0 6.964-6.193 14.862-23.668 30.183l-.148.129-.146.131c-9.937 8.856-20.841 18.116-33.253 25.851C48.537 195.798 0 207.486 0 252.8c0 56.928 35.286 92 83.2 92 8.026 0 15.489-.814 22.4-2.176V428.8c0 45.099 38.101 83.2 83.2 83.2zm0-48c-18.7 0-35.2-16.775-35.2-35.2V270.4c-17.325 0-35.2 26.4-70.4 26.4-26.4 0-35.2-20.625-35.2-44 0-8.794 32.712-20.445 56.1-34.926 14.575-9.074 27.225-19.524 39.875-30.799 18.374-16.109 36.633-33.836 39.596-59.075h176.752C364.087 170.79 400 202.509 400 248v21.299c0 40.524-22.197 57.124-61.325 50.601-8.001 14.612-33.979 24.151-53.625 12.925-18.225 19.365-46.381 17.787-61.05 4.95V428.8c0 18.975-16.225 35.2-35.2 35.2zM328 64c0-13.255 10.745-24 24-24s24 10.745 24 24-10.745 24-24 24-24-10.745-24-24z" />
            </svg>
          </Link>
        </Button>
      </div>
    </section>
  );
}
