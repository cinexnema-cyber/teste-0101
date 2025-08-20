import { Header } from "./Header";
import { Footer } from "./Footer";
import TestPlatformBanner from "@/components/TestPlatformBanner";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TestPlatformBanner />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
