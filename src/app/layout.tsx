import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NoZoom } from "@/components/no-zoom";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
        <NoZoom />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
