import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { SystemProvider } from '@repo/system';
import { fonts } from '@repo/system/lib/fonts';
import './globals.css';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
export const metadata: Metadata = createMetadata({
  title: 'Console',
  description: 'Hisaab Sathi Console Application',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fonts}>
        <SystemProvider>{children}</SystemProvider>
        <Toolbar />
      </body>
    </html>
  );
}
