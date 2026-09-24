import type { Metadata, Viewport } from "next";
import { bricolage, inter, plexMono } from "@/lib/fonts";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "SheRISE",
  description:
    "A community, skill-training, and reintegration platform for women rising after correctional and rehabilitation centres in Nigeria.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2A0E2E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
