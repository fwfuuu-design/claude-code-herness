import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { I18nProvider } from "@/lib/i18n";
import en from "@/i18n/messages/en.json";
import zh from "@/i18n/messages/zh.json";
import "../globals.css";

const locales = ["en", "zh"] as const;
type Locale = (typeof locales)[number];

const metaMessages: Record<Locale, typeof en> = { en, zh };

const spaceGrotesk = localFont({
  src: "../../../public/fonts/SpaceGrotesk-Variable.woff2",
  display: "swap",
  style: "normal",
  weight: "300 700",
  variable: "--font-space-grotesk",
  fallback: ["Arial", "sans-serif"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = metaMessages[locale as Locale] ?? metaMessages.en;

  return {
    title: messages.meta.title,
    description: messages.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const messages = metaMessages[locale as Locale];

  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`dark ${spaceGrotesk.variable}`}
    >
      <body className="antialiased">
        <a className="skip-link" href="#main-content">
          {messages.nav.skip_to_content}
        </a>
        <I18nProvider locale={locale}>
          <Header />
          <main id="main-content" className="site-main" tabIndex={-1}>
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
