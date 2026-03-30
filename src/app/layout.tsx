import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wanderlust — Your Passport, Your Journey',
  description: 'Upload your passport stamps. See your travels come alive on an interactive globe.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
