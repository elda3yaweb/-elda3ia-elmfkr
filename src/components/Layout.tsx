import { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Watermark from './Watermark';
import Announcement from './Announcement';
import FloatingControls from './FloatingControls';
import Assistant from './Assistant';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-bg">
      <Watermark />
      <Announcement />
      <Header />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      <FloatingControls />
      <Assistant />
    </div>
  );
}
