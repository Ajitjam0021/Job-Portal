import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './mobile.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ScrollProgress from '@/components/ScrollProgress';
import CustomCursor from '@/components/CustomCursor';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Job Listing Portal - Find Your Dream Job',
  description: 'The best job portal to find your dream job. Search for jobs by title, location, and salary. Connect with top employers and advance your career today.',
  keywords: ['job portal', 'job search', 'hiring', 'recruitment', 'career', 'jobs', 'remote jobs', 'tech jobs'],
  openGraph: {
    title: 'Job Listing Portal',
    description: 'Find your dream job with our clean and efficient portal.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'glass-morphism',
              style: {
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#333',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px',
              },
            }}
          />
          <ScrollProgress />
          <CustomCursor />
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
