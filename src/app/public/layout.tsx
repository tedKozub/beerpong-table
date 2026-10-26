import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "🦊 SPPDF Beer Pong - Výsledky",
  description: "Veřejné výsledky Beer Pong turnajů SPPDF",
  icons: {
    icon: "/icon.svg",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var m = localStorage.getItem('beerpong_theme_mode');
                var t = 'beerpong-light';
                if (m === 'dark') {
                  t = 'beerpong-dark';
                } else if (m === 'light') {
                  t = 'beerpong-light';
                } else {
                  t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'beerpong-dark' : 'beerpong-light';
                }
                document.documentElement.setAttribute('data-theme', t);
                if (t === 'beerpong-dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col bg-base-200 text-base-content transition-colors duration-150`}
      >
        {children}
      </body>
    </html>
  );
}
