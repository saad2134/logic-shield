import "@/app/globals.css";

import { Providers } from "@/context/providers";
import { inter } from "@/lib/fonts";
import ClickSpark from '@/components/ClickSpark';

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden " suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className}  antialiased overflow-x-hidden`}>
        <ClickSpark
          sparkColor='#1e5bc5'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <Providers>{children}</Providers>
        </ClickSpark>

      </body>
    </html>
  );
}
