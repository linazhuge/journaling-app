import type { Metadata } from "next";
import { Lora, Merriweather, EB_Garamond, Courier_Prime } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-eb-garamond",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-courier-prime",
});

export const metadata: Metadata = {
  title: "Journal",
  description: "A physical journal simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${merriweather.variable} ${ebGaramond.variable} ${courierPrime.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
