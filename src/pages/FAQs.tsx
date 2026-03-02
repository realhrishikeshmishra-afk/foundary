import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqsService, FAQ } from "@/services/faqs";

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const data = await faqsService.getAll();
      setFaqs(data);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">Support</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Frequently Asked <span className="text-gradient-gold">Questions</span></h1>
          </AnimatedSection>

          <AnimatedSection>
            {loading ? (
              <div className="text-center text-muted-foreground py-12">Loading FAQs...</div>
            ) : faqs.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No FAQs available at the moment.</div>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="bg-gradient-card border border-border rounded-lg px-6 overflow-hidden">
                    <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}
