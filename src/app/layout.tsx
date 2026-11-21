import type { Metadata } from 'next';
import Script from 'next/script';
import { createElement, type ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHAUGHV Timer',
  description: 'Countdown, stopwatch, and interval timing by SHAUGHV.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.shaughv.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.shaughv.com/fonts/makira/makira.css" />
        <link rel="stylesheet" href="https://cdn.shaughv.com/fonts/geist-mono/geist-mono.css" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('timer-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
      </head>
      <body>
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="identity-pair">
              {createElement('shaughv-mark', { 'data-static': '', 'aria-label': 'SHAUGHV', role: 'img' })}
              <span className="crest" role="img" aria-label="Shaughnessy crest" />
            </div>
            <small>© {new Date().getFullYear()} Emmett Shaughnessy</small>
          </div>
        </footer>
        {createElement('shaughv-cursor', { color: 'sage' })}
        <Script src="https://cdn.shaughv.com/js/animated-brand-mark.js" strategy="afterInteractive" />
        <Script
          src="https://cdn.shaughv.com/js/shaughv-cursor.js?v=2026-10-21.4"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
