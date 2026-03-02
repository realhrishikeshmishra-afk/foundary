import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { pageContentService, PageContent } from "@/services/pageContent";

export default function AboutPage() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await pageContentService.getByPageKey('about');
      setContent(data);
    } catch (error) {
      console.error('Error loading about content:', error);
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
            <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">Our Story</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              {loading ? "Loading..." : content?.title || "The Vision Behind Foundarly"}
            </h1>
          </AnimatedSection>

          <AnimatedSection>
            {loading ? (
              <div className="text-center text-muted-foreground py-12">Loading content...</div>
            ) : (
              <div className="bg-gradient-card border border-border rounded-lg p-8 md:p-12">
                <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-8">
                  <span className="font-display text-2xl font-bold text-primary">F</span>
                </div>

                <div className="space-y-6 text-muted-foreground leading-relaxed whitespace-pre-line">
                  {content?.content || "Content not available."}
                </div>
              </div>
            )}
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}
