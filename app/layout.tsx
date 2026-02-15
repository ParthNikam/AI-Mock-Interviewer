import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { ThemeProvider as NextThemesProvider } from "next-themes"

import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/auth-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Interviewer",
  description: "Ace all your interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextThemesProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
          {/* AuthProvider must wrap any component that calls useAuth (sidebar, pages, etc.) */}
          <AuthProvider>
            <SidebarProvider className="flex min-h-screen w-screen">
              <AppSidebar />
              <main className="flex-1 relative overflow-auto">
                {children}
              </main>
            </SidebarProvider>
          </AuthProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
