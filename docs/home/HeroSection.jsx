import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getImageWithFallback } from '@/lib/blobStorage';

export default function HeroSection({ heroImage, heroHeading, heroParagraph }) {
  const imageSrc = getImageWithFallback(heroImage);

  return (
    <section className="relative min-h-[350px] sm:min-h-[400px] md:min-h-[450px] w-full overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--primary)/.1)_25%,transparent_25%,transparent_50%,hsl(var(--primary)/.1)_50%,hsl(var(--primary)/.1)_75%,transparent_75%,transparent)] bg-[length:32px_32px] sm:bg-[length:48px_48px] md:bg-[length:64px_64px] animate-[grain_8s_steps(1)_infinite]" />
      
      {/* Main Background Image */}
      <Image
        src={imageSrc}
        alt="Megaskyshop Hero"
        fill
        sizes="100vw"
        priority
        className="scale-105 animate-[slowZoom_20s_ease-in-out_infinite] object-cover object-center"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/.90)] via-[hsl(var(--primary)/.50)] to-transparent sm:from-[hsl(var(--primary)/.85)] sm:via-[hsl(var(--primary)/.40)]">
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.70)] via-transparent to-transparent sm:from-[hsl(var(--primary)/.60)]" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-l-2 sm:border-l-4 border-t-2 sm:border-t-4 border-white/20 -translate-x-2 -translate-y-2 sm:-translate-x-4 sm:-translate-y-4" />
          <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-r-2 sm:border-r-4 border-b-2 sm:border-b-4 border-white/20 translate-x-2 translate-y-2 sm:translate-x-4 sm:translate-y-4" />

          {/* Text Content */}
          <div className="max-w-xl md:max-w-2xl lg:max-w-3xl relative">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg animate-[slideUp_0.5s_ease-out] leading-tight">
              {heroHeading}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-md sm:max-w-xl md:max-w-2xl drop-shadow-md font-medium animate-[slideUp_0.7s_ease-out] leading-relaxed">
              {heroParagraph}
            </p>
            
            {/* CTA Button */}
            <div className="animate-[slideUp_0.9s_ease-out]">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-10 font-semibold hover:bg-white/90 hover:text-[hsl(var(--primary))] hover:scale-105 transition-all duration-300 relative group overflow-hidden"
              >
                <Link href="#order-form" className="flex items-center">
                  <span className="relative z-10">অর্ডার করতে চাই</span>
                  <svg
                    aria-hidden="true"
                    className="e-font-icon-svg e-far-hand-point-down ml-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:animate-bounce"
                    viewBox="0 0 448 512"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <path d="M188.8 512c45.616 0 83.2-37.765 83.2-83.2v-35.647a93.148 93.148 0 0 0 22.064-7.929c22.006 2.507 44.978-3.503 62.791-15.985C409.342 368.1 448 331.841 448 269.299V248c0-60.063-40-98.512-40-127.2v-2.679c4.952-5.747 8-13.536 8-22.12V32c0-17.673-12.894-32-28.8-32H156.8C140.894 0 128 14.327 128 32v64c0 8.584 3.048 16.373 8 22.12v2.679c0 6.964-6.193 14.862-23.668 30.183l-.148.129-.146.131c-9.937 8.856-20.841 18.116-33.253 25.851C48.537 195.798 0 207.486 0 252.8c0 56.928 35.286 92 83.2 92 8.026 0 15.489-.814 22.4-2.176V428.8c0 45.099 38.101 83.2 83.2 83.2zm0-48c-18.7 0-35.2-16.775-35.2-35.2V270.4c-17.325 0-35.2 26.4-70.4 26.4-26.4 0-35.2-20.625-35.2-44 0-8.794 32.712-20.445 56.1-34.926 14.575-9.074 27.225-19.524 39.875-30.799 18.374-16.109 36.633-33.836 39.596-59.075h176.752C364.087 170.79 400 202.509 400 248v21.299c0 40.524-22.197 57.124-61.325 50.601-8.001 14.612-33.979 24.151-53.625 12.925-18.225 19.365-46.381 17.787-61.05 4.95V428.8c0 18.975-16.225 35.2-35.2 35.2zM328 64c0-13.255 10.745-24 24-24s24 10.745 24 24-10.745 24-24 24-24-10.745-24-24z" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx global>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0) }
          10% { transform: translate(-5%, -5%) }
          20% { transform: translate(5%, 5%) }
          30% { transform: translate(-5%, 5%) }
          40% { transform: translate(5%, -5%) }
          50% { transform: translate(-5%, 0%) }
          60% { transform: translate(5%, 0%) }
          70% { transform: translate(0%, 5%) }
          80% { transform: translate(0%, -5%) }
          90% { transform: translate(-2%, 2%) }
        }
        @keyframes slowZoom {
          0%, 100% { transform: scale(1.05) }
          50% { transform: scale(1.1) }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
