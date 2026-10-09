import type { Metadata, Viewport } from "next";
import { Fredoka, Geist, Geist_Mono, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { AppearanceSync } from "@/components/appearance-sync";
import { NoZoom } from "@/components/no-zoom";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ToastProvider } from "@/components/ui/toast";
import { APPEARANCE_INIT_SCRIPT } from "@/lib/appearance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Rounded display type for titles, buttons and numbers (the playful voice of the app, ADR 0006).
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

// Pixel font of the retro touch (ADR 0007): small labels and numbers only, never paragraphs.
const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Rarely used: no need to preload it on every page.
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "DrawToday", template: "%s · DrawToday" },
  description: "Apprends à dessiner : exercices, conseils et vidéos.",
  applicationName: "DrawToday",
  // iOS: standalone mode when added to the home screen.
  appleWebApp: { capable: true, title: "DrawToday", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    // The paper of the design system (`--background` in globals.css).
    { media: "(prefers-color-scheme: light)", color: "#fff6e5" },
    { media: "(prefers-color-scheme: dark)", color: "#17122b" },
  ],
  // Required for env(safe-area-inset-*) on iPhones with a notch.
  viewportFit: "cover",
  // The app is laid out as a native-style mobile app at 100 %: no pinch or double-tap zoom of the page. Android
  // honours these; iOS ignores them, so `NoZoom` and `touch-action` in globals.css cover it. Content that must be
  // zoomable (drawings, reference images) uses an in-app viewer (ADR 0004).
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${fredoka.variable} ${pixelify.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Puts the chosen theme on the page before the first paint (no flash of the default look). */}
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
        <NoZoom />
        <AppearanceSync />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
