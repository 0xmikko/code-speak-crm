import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';
import { Layout } from '@/components/layout/layout';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Decentralized Protocol CRM',
  description: 'CRM for managing protocol assets, LPs, and integrations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">
        <SessionProvider>
          <Layout>
            {children}
          </Layout>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}