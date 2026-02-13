import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function CountryFAQ({ faqs }) {
  const defaultFAQs = faqs || [
    {
      question: 'What are the entry requirements?',
      answer: 'Entry requirements vary by university and program. Generally, you need a good academic record, English proficiency test scores (IELTS/TOEFL), and relevant documents.'
    },
    {
      question: 'How much does it cost to study?',
      answer: 'Tuition fees range from $10,000 to $40,000 per year depending on the program and university. Living expenses are additional.'
    },
    {
      question: 'Can I work while studying?',
      answer: 'Yes, most student visas allow part-time work (up to 20 hours per week during term time and full-time during holidays).'
    },
    {
      question: 'What scholarships are available?',
      answer: 'Various scholarships are available based on merit, need, and specific criteria. Contact us for personalized scholarship matching.'
    },
    {
      question: 'How long does the visa process take?',
      answer: 'Visa processing typically takes 2-4 weeks, but can vary. We recommend applying at least 3 months before your intended start date.'
    }
  ];

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {defaultFAQs.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border border-gray-200 rounded-lg px-6 bg-white"
        >
          <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-education-blue">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}