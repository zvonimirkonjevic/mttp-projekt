"use client";

import {
  Navbar,
  Hero,
  LogoCarousel,
  BadgeSection,
  TransformationDemo,
  Features,
  HowItWorks,
  Testimonials,
  IndustrySolutions,
  Footer,
} from "./components/landing_page";

export default function Home() {
  return (
    <main className="bg-background min-h-screen selection:bg-brand selection:text-white">
      <Navbar />
      <Hero />
      <LogoCarousel />
      <BadgeSection />
      <TransformationDemo />
      <Features />
      <HowItWorks />
      <Testimonials />
      <IndustrySolutions />
      <Footer />
    </main>
  );
}
