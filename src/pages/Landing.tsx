import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import {
  SocialProof, ProblemaSolucao, Funcionalidades, ComoFunciona,
  Depoimentos, Planos, FAQ, CTAFinal, Footer, TecnologiaSection,
} from "@/components/landing/Sections";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <SocialProof />
      <ProblemaSolucao />
      <Funcionalidades />
      <ComoFunciona />
      <TecnologiaSection />
      {/* <Depoimentos /> */}
      <Planos />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  );
}
