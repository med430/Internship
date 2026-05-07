import { FaqAccordion } from "@/components/shared/faq-accordion";

export function FaqBlock() {
  return (
    <section id="faq" className="py-24 px-6 bg-card/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-heading">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Stagio
          </p>
        </div>

        <FaqAccordion />
      </div>
    </section>
  );
}
