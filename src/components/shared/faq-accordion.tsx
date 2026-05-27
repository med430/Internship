"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Stagio and how does it help me?",
    answer:
      "Stagio is an AI-powered career toolkit designed to streamline your job search. It combines CV optimization, intelligent job matching from multiple sources, personalized career guidance, mock interview preparation, and portfolio building—all while keeping your data private through anonymization.",
  },
  {
    question: "How does the CV optimizer work?",
    answer:
      "Our CV optimizer analyzes your resume and tailors it for specific job postings. It generates professional LaTeX-formatted CVs that are ATS-friendly and optimized for the roles you're targeting, highlighting relevant skills and experiences.",
  },
  {
    question: "Where do the job listings come from?",
    answer:
      "Stagio collects job listings posted directly by recruiters on the platform. Our AI matching algorithm then ranks these opportunities based on how well they align with your skills, preferences, and career goals.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. Stagio uses anonymization techniques when processing your data through our AI systems. Your personal information is encrypted, and we follow industry best practices for data security. You maintain full control over your information.",
  },
  {
    question: "What makes the virtual interviewer different?",
    answer:
      "Our virtual interviewer uses advanced AI to conduct realistic mock interviews with voice interaction. It adapts questions based on your responses, provides detailed feedback on your answers, and helps you prepare for real interviews with confidence.",
  },
  {
    question: "Can I use Stagio for free?",
    answer:
      "Yes! We offer a free Starter plan with essential features including basic CV analysis and limited job matches. For advanced features like unlimited CV optimization, priority job matching, and the virtual interviewer, check out our Pro and Enterprise plans.",
  },
  {
    question: "How does the career guide feature work?",
    answer:
      "The career guide provides a personalized 5-step roadmap based on your current situation and goals. It offers actionable advice on skill development, networking strategies, application tactics, and career progression tailored to your target industry.",
  },
  {
    question: "What is the portfolio builder?",
    answer:
      "The portfolio builder automatically generates a professional HTML portfolio website from your CV. It showcases your skills, projects, and experience in a modern, responsive format that you can share with potential employers or clients.",
  },
  {
    question: "Do I need any technical knowledge to use Stagio?",
    answer:
      "Not at all! Stagio is designed to be user-friendly and intuitive. Simply upload your CV, set your preferences, and let our AI handle the complex processing. The interface is clean and straightforward for users of all technical backgrounds.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time with no penalties. Your access will continue until the end of your current billing period, and you won't be charged for the next cycle.",
  },
];

export function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={faq.question}
          value={`faq-${index}`}
          className="border border-border rounded-lg bg-card/30 overflow-hidden transition-all"
        >
          <AccordionTrigger
            className="w-full px-6 py-4 text-left hover:bg-accent/5 transition-colors hover:no-underline"
          >
            <span className="font-semibold text-base pr-8 font-heading leading-snug">
              {faq.question}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 text-muted-foreground text-base leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
