import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from "sonner";
import { RoleCheckWrapper } from "@/components/auth/role-check-wrapper";

export const metadata: Metadata = {
  title: "NTouks - Assistance Automobile",
  description: "Plateforme d'assistance automobile au Cameroun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <RoleCheckWrapper>
          {children}
        </RoleCheckWrapper>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
