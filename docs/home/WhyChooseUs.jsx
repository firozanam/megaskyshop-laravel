import Link from "next/link";
import { Button } from "@/components/ui/button";

const benefits = [
  "৩০ থেকে ৪০ মিনিট পর্যন্ত অবিরাম সঙ্গম করতে সক্ষম হবেন।",
  "এই কনডমটি খুব নরম এবং পিচ্ছিল।",
  "সঙ্গী এতে কোনও ব্যথা অনুভব করবে না (সাধারণ কনডমের মতোই নরম)।",
  "এটি ব্যবহারে কোনও ক্ষতি নেই।",
  "একটি কনডম ৫০০ বারেরও বেশি ব্যবহার করা যায়।",
  "এই কনডমটি সব লিঙ্গের মানুষ ব্যবহার করতে পারে।",
];

export default function WhyChooseUs() {
  return (
    <section className="relative w-full -mx-[calc((100vw-100%)/2)] px-[calc((100vw-100%)/2)] bg-[hsl(var(--primary))] text-white py-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--secondary)/.03)_25%,transparent_25%,transparent_50%,hsl(var(--secondary)/.03)_50%,hsl(var(--secondary)/.03)_75%,transparent_75%,transparent)] bg-[length:64px_64px]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--secondary)/.1)] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--secondary)/.1)] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10 relative">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 animate-[fadeIn_1s_ease-out]">
            কেন নিবেন এই ম্যাজিক কনডম?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-[slideUp_0.5s_ease-out]">
            আপনি কি আপনার স্ত্রীকে খুশি দেখতে চান? আপনি কি আপনার স্ত্রীকে আরও
            আনন্দ দিতে চান? তাহলে সাধারণ কনডমের পরিবর্তে ম্যাজিক কনডম ব্যাবহার করুন
            (এই কনডমটি সিলিকন দিয়ে তৈরি)।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="flex items-start p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transform hover:scale-105 transition-all duration-300 animate-[fadeIn_0.5s_ease-out]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 p-2 bg-green-500 rounded-lg mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p className="text-base text-white/90">{item}</p>
            </div>
          ))}
        </div>

        <div className="text-center relative animate-[slideUp_0.7s_ease-out]">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-xl py-6 px-10 font-semibold relative group overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            <Link href="#order-form" className="flex items-center">
              <span className="relative z-10">অর্ডার করতে চাই</span>
              <svg
                aria-hidden="true"
                className="e-font-icon-svg e-far-hand-point-down ml-2 w-6 h-6 group-hover:animate-bounce"
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
      `}</style>
    </section>
  );
}
