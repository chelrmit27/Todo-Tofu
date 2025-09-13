import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: "ToDoTofu - Task Management Made Easy",
  description: "A modern task management app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
