import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import { AuthProvider } from "@/contexts/auth.context";

config.autoAddCss = false; 

export const metadata: Metadata = {
  title: "ExamPrep Platform",
  description: "Practice and enhance your skills with our comprehensive question bank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
