import type { Metadata } from "next";
import { Providers } from "./providers";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Contract Operations Console",
  description: "Organisation-scoped contract operations dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
