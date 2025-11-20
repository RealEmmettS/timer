import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TimerProvider } from "@/context/TimerContext";

const clarweMono = localFont({
  variable: "--font-clarwe-mono",
  display: "swap",
  src: [
    { path: "../../ID Clarwe Mono Web/IDClarweMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../ID Clarwe Mono Web/IDClarweMono-Regular.woff", weight: "400", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Bauhaus Timer",
  description: "A high-fidelity, minimalist timer application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${clarweMono.variable} antialiased`}
      >
        <TimerProvider>
          {children}
        </TimerProvider>
      </body>
    </html>
  );
}
