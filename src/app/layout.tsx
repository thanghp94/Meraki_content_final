
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { GameProvider } from '@/contexts/GameContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LibraryProvider } from '@/contexts/LibraryContext';
import Header from '@/components/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GridWise Quizzing',
  description: 'Interactive quiz game platform for educators.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background`}>
        <AuthProvider>
          <GameProvider>
            <LibraryProvider>
              {/* Header might be conditional based on route in more complex apps */}
              {/* <Header /> */} 
              <main className="flex-grow"> {/* Removed container and padding to allow pages to control their own layout fully */}
                {children}
              </main>
              <Toaster />
            </LibraryProvider>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
