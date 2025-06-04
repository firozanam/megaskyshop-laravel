export default function PriceInfo() {
  return (
    <section className="my-8 sm:my-12 md:my-16">
      <div 
        className="w-full bg-[hsl(var(--primary)/.98)] relative py-8 sm:py-12 md:py-16 -mx-[calc((100vw-100%)/2)] px-[calc((100vw-100%)/2)] overflow-hidden"
      >
        {/* Background with overlay and pattern */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/texture-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--primary)/.1)_25%,transparent_25%,transparent_50%,hsl(var(--primary)/.1)_50%,hsl(var(--primary)/.1)_75%,transparent_75%,transparent)] bg-[length:32px_32px] sm:bg-[length:48px_48px] md:bg-[length:64px_64px] opacity-30" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-[hsl(var(--secondary)/.15)] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl sm:blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-[hsl(var(--secondary)/.15)] rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl sm:blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6 md:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Price Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-xl md:max-w-2xl mx-auto transform hover:scale-105 transition-all duration-300">
              {/* First Price Line */}
              <div className="flex items-center justify-center whitespace-nowrap gap-1 sm:gap-2 mb-4 sm:mb-6 animate-[slideDown_0.5s_ease-out]">
                <span className="text-white/90 text-lg sm:text-2xl md:text-3xl font-bold">পূর্বের মূল্য</span>
                <div className="relative inline-flex items-center">
                  <span className="text-red-400 text-xl sm:text-3xl md:text-4xl font-bold line-through decoration-2">৯৯৯/=</span>
                  <div className="absolute -right-3 sm:-right-4 -top-3 sm:-top-4 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                    -20.92%
                  </div>
                </div>
                <span className="text-white/90 text-lg sm:text-2xl md:text-3xl font-bold">টাকা</span>
              </div>

              {/* Second Price Line */}
              <div className="flex items-center justify-center whitespace-nowrap gap-1 sm:gap-2 animate-[slideUp_0.5s_ease-out]">
                <span className="text-white/90 text-lg sm:text-2xl md:text-3xl font-bold">বর্তমান মূল্য</span>
                <span className="text-yellow-300 text-2xl sm:text-4xl md:text-5xl font-bold glow">৭৯০-/=</span>
                <span className="text-white/90 text-lg sm:text-2xl md:text-3xl font-bold">টাকা</span>
              </div>
            </div>

            {/* Free Delivery Card */}
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto animate-[fadeIn_0.7s_ease-out]">
              <div className="flex items-start sm:items-center justify-start sm:justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mt-1 sm:mt-0 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-300 text-base sm:text-lg md:text-xl font-medium text-left sm:text-center">
                  ১০০% অরিজিনাল ম্যাজিক কনডম প্রতিটি মাত্র ৭৯০ টাকা
                </p>
              </div>
              <div className="flex items-start sm:items-center justify-start sm:justify-center gap-2 sm:gap-3">
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mt-1 sm:mt-0 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-300 text-base sm:text-lg md:text-xl font-medium text-left sm:text-center">
                  সারা বাংলাদেশের যে কোন জায়গায় ফ্রি ডেলিভারি চার্জ ফ্রি!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .glow {
          text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
          animation: glow 2s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from { text-shadow: 0 0 10px rgba(253, 224, 71, 0.5); }
          to { text-shadow: 0 0 20px rgba(253, 224, 71, 0.8); }
        }
      `}</style>
    </section>
  );
}
