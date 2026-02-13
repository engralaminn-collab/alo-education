import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Which English test is best for UK study?',
    answer: 'IELTS or IELTS UKVI is recommended for UK study, depending on your visa requirements. IELTS UKVI is specifically required for certain UK visa routes.'
  },
  {
    question: 'Can I apply without IELTS?',
    answer: 'Yes, some universities accept alternative tests like Duolingo, PTE, or MOI (Medium of Instruction). However, eligibility depends on the specific institution and course level.'
  },
  {
    question: 'Is English test mandatory for visa?',
    answer: 'In most cases, yes. However, requirements vary by country and course level. Some countries offer exemptions for certain educational backgrounds.'
  },
  {
    question: 'Can I retake the test if I don\'t meet the score?',
    answer: 'Yes, most English tests allow multiple attempts. You can retake after a waiting period (usually 3-5 days for most tests).'
  },
  {
    question: 'Does ALO provide coaching?',
    answer: 'We provide comprehensive preparation guidance, study resources, practice strategies, and mock test feedback to help you achieve your target score.'
  },
  {
    question: 'What is the difference between IELTS and IELTS UKVI?',
    answer: 'IELTS UKVI is the government-approved version specifically for UK visa applications. It has stricter security measures and is recognized by UK Visas and Immigration (UKVI).'
  },
  {
    question: 'How long are English test scores valid?',
    answer: 'Most English proficiency test scores are valid for 2 years from the test date. This varies slightly by test and institution.'
  },
  {
    question: 'Which test has the fastest results?',
    answer: 'Duolingo English Test provides the fastest results, with scores typically available within 48 hours. PTE also offers quick results (2-5 days).'
  }
];

export default function LanguageTestFAQ() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-alo-orange" />
          <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left hover:text-alo-orange transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}