import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ProductShowcase from "@/components/ProductShowcase";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <ProductShowcase />
        <HowItWorks />
      </main>

      <Footer />
    </>
  );
}