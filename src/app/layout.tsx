import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { TopNav } from "@/components/layout/TopNav";
import { CartBar } from "@/components/layout/CartBar";
import { CartModalProvider } from "@/components/cart/CartModal";

export const metadata: Metadata = {
  title: "Intime",
  description: "Order groceries from your local shop",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Intime",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1b5e3f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-page-bg">
        <Providers>
          <CartModalProvider>
            <TopNav />
            <main>{children}</main>
            <CartBar />
          </CartModalProvider>
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
