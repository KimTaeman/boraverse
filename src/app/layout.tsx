import type { Metadata } from "next";
import { Header, Footer } from "@/components/shell";
import "./globals.css";

export const metadata: Metadata = { title: { default: "The Little Boraverse", template: "%s | The Little Boraverse" }, description: "An unofficial ARMY-made little world for Bangkok 2026." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header /><main id="main">{children}</main><Footer /></body></html>;
}
