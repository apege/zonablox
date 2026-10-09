import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TopUpSection from "./components/TopUpSection";
import HowToOrderSection from "./components/HowToOrderSection";
import WhyUsSection from "./components/WhyUsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070e0b] text-zinc-100 selection:bg-orange-500 selection:text-white font-sans antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <TopUpSection />
        <HowToOrderSection />
        <WhyUsSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
