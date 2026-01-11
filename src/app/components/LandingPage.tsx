import { Header } from './landing/Header';
import { Hero } from './landing/Hero';
import { Services } from './landing/Services';
import { HowItWorks } from './landing/HowItWorks';
import { WhoIsItFor } from './landing/WhoIsItFor';
import { CTA } from './landing/CTA';
import { Footer } from './landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <WhoIsItFor />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
