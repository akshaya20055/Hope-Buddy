import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext.tsx";
import { LanguageProvider } from "../context/LanguageContext.tsx";
import { AuthProvider } from "../context/AuthContext.tsx";
import { Sidebar } from "../components/Sidebar.tsx";
import { Navbar } from "../components/Navbar.tsx";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HopeBuddy AI – Emotional Support & Motivation Assistant",
  description: "Find emotional comfort, exam motivation, coping resources, crisis hotlines, and friendly company using our premium AI support companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gradient-premium min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {/* App Shell layout with Navbar and Sidebar */}
              <div className="min-h-screen flex">
                <Sidebar />
                <div className="flex-1 flex flex-col min-h-screen md:pl-64">
                  <Navbar />
                  <main className="flex-1 pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
                    {children}
                  </main>
                </div>
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
