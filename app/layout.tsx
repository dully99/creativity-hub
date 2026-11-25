import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tanzania Creative Hub",
    template: "%s | Tanzania Creative Hub",
  },
  description: "Tanzania Creative Hub — manage objectives, targets, activities, and tasks.",
  icons: {
    icon: "/coat.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>{children}</QueryProvider>
            <Toaster
              position="top-center"
              className="rounded-md"
              expand={true}
              duration={5000}
              richColors
              closeButton={false}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
