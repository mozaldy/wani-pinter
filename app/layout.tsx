import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const mono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.meta.title, description: dict.meta.description };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return (
    <html lang={locale} className={`${jakarta.variable} ${fraunces.variable} ${mono.variable}`}>
      <body>
        <I18nProvider locale={locale} dict={dict}>{children}</I18nProvider>
      </body>
    </html>
  );
}
