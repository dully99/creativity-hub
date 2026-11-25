"use client";

import { useLanguageStore } from "@/store/useLanguageStore";
import Image from "next/image";
import { Button } from "../ui/button";

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <Button
      onClick={toggleLanguage}
      className="text-primary rounded-md bg-white"
      variant="ghost"
      aria-label="Toggle language"
    >
      <Image
        src={language === "en" ? "/icons/uk.svg" : "/icons/tz.svg"}
        alt={language === "en" ? "English" : "Swahili"}
        width={24}
        height={24}
        className="rounded-full"
      />
      <span className="text-sm font-medium">{language === "en" ? "English" : "Kiswahili"}</span>
    </Button>
  );
}
