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
    <html lang="en" className="overflow-x-hidden ">
      <body className={`${inter.className}  antialiased overflow-x-hidden`}>
        <ClickSpark
          sparkColor='#c59a1e'
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
