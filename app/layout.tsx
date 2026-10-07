import { Fraunces, Inter_Tight } from "next/font/google";
import "./globals.css";
import NavHeader from "@/components/NavHeader";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${interTight.variable} font-body bg-sand-50 text-teal-900`}>
        <LanguageProvider>
          <NavHeader />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}