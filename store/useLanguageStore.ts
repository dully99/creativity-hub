import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "sw";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === "en" ? "sw" : "en",
        })),
    }),
    {
      name: "language-storage",
    }
  )
);
