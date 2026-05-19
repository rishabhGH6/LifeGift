import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

const faqs = [
  {
    question: "Can I donate blood if I recently got a tattoo or piercing?",
    answer: "You typically need to wait 3-6 months after getting a tattoo or piercing before you can safely donate blood. This waiting period ensures your safety and the safety of the recipient."
  },
  {
    question: "Who can register as an organ donor?",
    answer: "Anyone of any age or medical history can register! Your medical condition at the time of death will determine what organs and tissues can be donated."
  },
  {
    question: "Does organ donation disfigure the body or prevent an open-casket funeral?",
    answer: "Not at all. Organ recovery is a highly respected surgical procedure. The body is treated with the utmost dignity, and an open-casket funeral is absolutely possible after donation."
  },
  {
    question: "Is there any cost to my family if I donate organs?",
    answer: "No. All costs related to the medical evaluation, recovery, and matching of organs are paid for by the organ procurement organization. Your family will not be billed for any part of the donation process."
  },
  {
    question: "How long does a typical blood donation take?",
    answer: "The actual blood drawing process only takes about 8-10 minutes! However, you should allow about an hour for the entire process, including registration, a mini-physical, and a short recovery time with snacks."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="faq-header">
          <h2>Frequently Asked <span className="text-gradient-red">Questions</span></h2>
          <p>Got questions? We've got answers. Learn more about the life-saving impact you can make.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              className={`faq-item glass-panel ${activeIndex === index ? 'active' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFAQ(index)}
              >
                <h3>{faq.question}</h3>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="faq-icon" />
                </motion.div>
              </div>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div 
                    className="faq-answer-wrapper"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
