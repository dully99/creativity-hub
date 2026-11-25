"use client";

import Image from "next/image";

const CORE_VALUES = [
  { label: "Integrity", color: "bg-blue-500" },
  { label: "Transparency", color: "bg-sky-500" },
  { label: "Teamwork", color: "bg-green-500" },
  { label: "Professionalism", color: "bg-amber-500" },
  { label: "Innovativeness", color: "bg-purple-500" },
  { label: "Accountability", color: "bg-rose-500" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white border-t mt-auto">
      {/* Colored top border stripes */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#4CAF50]"></div>
        <div className="flex-1 bg-[#FDD835]"></div>
        <div className="flex-1 bg-[#000000]"></div>
      </div>

      {/* Footer content */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Logo and text */}
          <div className="flex items-center gap-3">
            <Image
              src="/coat.png"
              alt="Tanzania Coat of Arms"
              width={32}
              height={32}
              className="object-contain"
            />
            <div className="text-xs text-gray-600">
              <div>© {currentYear} Tanzania Creative Hub</div>
              <div className="text-gray-500">All rights reserved</div>
            </div>
          </div>

          {/* Right side - Core Values */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <span className="font-semibold uppercase tracking-wide text-gray-800">
              Core Values
            </span>
            {CORE_VALUES.map((value) => (
              <div key={value.label} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${value.color}`} />
                <span className="uppercase tracking-wide text-gray-700">
                  {value.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
