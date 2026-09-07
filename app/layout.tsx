import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Play Chess — Atmosphere to Clarity',
  description:
    'A Chess.com design study: a staged board resolves into a clear play surface.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: '#302e2b', colorScheme: 'dark' }}>
      <head>
        <meta name="theme-color" content="#302e2b" />
        <link
          rel="preload"
          href="/chess/chessglyph.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preload" href="/chess/200.png" as="image" />
        <noscript>
          <style>{'.chess-app.scene-booting { opacity: 1 !important; }'}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
