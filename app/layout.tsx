import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Play Chess — Chess.com Concept',
  description: 'An atmospheric pre-game experience that resolves into a clear chessboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
