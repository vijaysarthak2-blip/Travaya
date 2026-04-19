import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Travaya | Luxury Travel Explorer",
    template: "%s | Travaya"
  },
  description: "Experience the majestic blend of heritage, nature, and adventure with Travaya's curated premium expeditions.",
  keywords: ["travel", "india", "luxury tours", "adventure", "heritage", "nature"],
  authors: [{ name: "Travaya Team" }],
  openGraph: {
    title: "Travaya | Luxury Travel Explorer",
    description: "Curated expeditions through the heart of the subcontinent.",
    url: "https://travaya.com",
    siteName: "Travaya",
    images: [
      {
        url: "/packages-hero.png",
        width: 1200,
        height: 630,
        alt: "Travaya Luxury Travel",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travaya | Luxury Travel Explorer",
    description: "Curated expeditions through the heart of the subcontinent.",
    images: ["/packages-hero.png"],
  },
};

import { CurrencyProvider } from "../context/CurrencyContext";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <CurrencyProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
