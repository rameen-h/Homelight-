import React, { useState } from 'react';
import './clientFAQs.css';

const ClientFAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Who is buying my home?',
      answer:
        'HomeLight has built a nationwide network of hundreds of pre-approved real estate cash buyers or investors. We let them compete to buy your home, so you can get the best offer.',
    },
    {
      question: 'Do I need an agent to participate?',
      answer:
        'No, you do not need an agent to request offers with HomeLight.',
    },
    {
      question: 'Can I sell a home that’s currently listed?',
      answer:
        'If you’re looking to sell your home fast and skip the showing process, we are happy to work with you to find the best solution that meets your needs.',
    },
    {
      question: 'Do I have to move right away?',
      answer:
        'No. You’ll have the flexibility to pick a move date that works for your schedule up to 30 days from closing.',
    },
    {
      question: 'Is there a cost to request offers?',
      answer:
        'No. Requesting an offer from HomeLight is completely free.',
    },
    {
      question: 'Am I obligated to accept an offer?',
      answer:
        'No, you are not obligated to accept any Simple Sale offer you receive.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq-section">
      <h2 className="faq-heading">Client FAQs</h2>
      <div className="accordion">
        {faqs.map((faq, idx) => (
          <div className="accordion-node" key={idx}>
            <div
              className="accordion-title"
              onClick={() => toggle(idx)}
            >
              <strong className="accordion-question">{faq.question}</strong>
              <button
                className={`accordion-btn ${openIndex === idx ? 'open' : ''}`}
                aria-expanded={openIndex === idx}
              >
                <svg
                  className="chevron"
                  viewBox="0 0 13 8"
                  aria-hidden="true"
                >
                  <path d="M5.66014,7.16797 L0.35547,1.86330 C0.22786,1.73569 0.16406,1.58075 0.16406,1.39846 C0.16406,1.21616 0.22786,1.06122 0.35547,0.93361 L0.95703,0.33205 C1.08463,0.20445 1.23958,0.13609 1.42187,0.12697 C1.60416,0.11786 1.75911,0.17710 1.88671,0.30471 L6.12499,4.5430 L10.3633,0.30471 C10.4909,0.17710 10.6458,0.11786 10.8281,0.12697 C11.0104,0.13609 11.1653,0.20445 11.2929,0.33205 L11.8945,0.93361 C12.0221,1.06122 12.0859,1.21616 12.0859,1.39846 C12.0859,1.58075 12.0221,1.73569 11.8945,1.86330 L6.58983,7.16797 C6.46222,7.31381 6.30728,7.38672 6.12499,7.38672 C5.94269,7.38672 5.78775,7.31381 5.66014,7.16797 Z" />
                </svg>
              </button>
            </div>
            {openIndex === idx && (
              <div className="accordion-body">
                <p>{faq.answer}</p>
              </div>
            )}
            <hr className="divider" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientFAQs;
