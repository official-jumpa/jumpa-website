"use client";
import { useState } from "react";

const faqs = [
  {
    question: "What is Jumpa?",
    answer:
      "Jumpa is a cross-border payment system that connects African businesses to the global economy.",
  },
  {
    question: "Is Jumpa secure?",
    answer:
      "Yes, we use top-tier security protocols to ensure your transactions and data are safe.",
  },
  {
    question: "Is Jumpa a bank?",
    answer:
      "Jumpa is a financial technology company, not a traditional bank, providing modern payment solutions.",
  },
  {
    question: "What countries does Jumpa support?",
    answer: "We support multiple countries across Africa and globally.",
  },
  {
    question: "What is the maximum limit per limit?",
    answer: "Transaction limits depend on your account verification level.",
  },
  {
    question: "Is there an app I can use?",
    answer: "Yes, our mobile app will be available soon.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#FBFBFB] py-24 px-14" id="faqs">
      <div className="bg-[#961BF0] rounded-[30px] flex flex-col gap-16 items-center text-white p-24">
        <h2 className="text-center text-[46px] font-bold">
          Frequently Asked Questions
        </h2>

        <div className="w-200 flex flex-col gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`py-6 px-5 border-[#F6F8FA] border-b-2 text-xl ${openIndex === index ? "open" : ""}`}
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex items-center justify-between gap-5">
                <h3>{faq.question}</h3>
                <span className="cursor-pointer">
                  {openIndex === index ? "-" : "+"}
                </span>
              </div>
              {openIndex === index && (
                <div className="text-sm">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
