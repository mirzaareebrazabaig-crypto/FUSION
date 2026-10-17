import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { FloatingCartBar } from "@/components/FloatingCartBar";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#3B1F14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: "ChocoFusion | Luxury Handcrafted Chocolates & Hampers",
  description:
    "Artisanal handcrafted chocolates made fresh daily in Mumbai. Roasted California nuts, pure cocoa butter, viral Dubai Kunafa bars, and bespoke festive hampers.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/logo.jpeg",
  },
  openGraph: {
    title: "ChocoFusion | Luxury Handcrafted Chocolates",
    description: "Premium handcrafted chocolates, freshly roasted nuts, and viral Kunafa bars delivered across Mumbai.",
    url: "https://chocofusion.in",
    siteName: "ChocoFusion",
    images: [
      {
        url: "/logo.jpeg",
        width: 800,
        height: 800,
        alt: "ChocoFusion Luxury Emblem",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans scroll-smooth`}>
      <head>
        <link rel="apple-touch-icon" href="/logo.jpeg" />
      </head>
      <body className="min-h-screen bg-[#FFF6EC] text-[#3B1F14] flex flex-col selection:bg-[#FF4F8B] selection:text-white">
        <CartProvider>
          {/* Universal Header with Logo & Cart Indicator */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-1 w-full">{children}</main>

          {/* Floating Cart Bar (appears when items in cart) */}
          <FloatingCartBar />

          {/* Mobile Bottom Navigation Bar (Hidden on Laptop/Desktop md+) */}
          <BottomNav />
        </CartProvider>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration error: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
