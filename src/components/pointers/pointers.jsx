import React from "react";
import "./pointers.css";

const pointers = [
  {
    title: "Get our best offer",
    description: "We use neighborhood data and local market experts to present the best offer to you. There’s no upfront cost for repairs and we never charge a program fee or closing costs.",
    img: "https://d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/components/icons/purchase-price-772382e79d22664be34b77438a5fcc1a.png",
  },
  {
    title: "Sell when you're ready",
    description: "There's no need to prep. When you’re ready, our dedicated Client Advisor will take care of everything.",
    img: "https://d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/components/icons/choose-date-b9ae74b57c52d9f2dc1fb22c849cd9c9.png",
  },
  {
    title: "Sell fast and confidently",
    description: "We can put cash in your hand in as few as 10 days.",
    img: "https://d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/components/icons/work-together-260856c01ace9309ce6f10567d0bef3c.png",
  },
];

export default function Pointers() {
  return (
    <div className="pointers-section">
      <div className="pointers-section__container">
        <h2 className="pointers-section__title">
          The fastest and easiest way to sell your home
        </h2>

        <div className="pointers-section__list">
          {pointers.map(({ title, description, img }) => (
            <div key={title} className="pointer-card">
              <div className="pointer-card__image-container">
                <img
                  src={img}
                  alt={`Icon for ${title}`}
                  className="pointer-card__image"
                  loading="lazy"
                />
              </div>
              <div className="pointer-card__text">
                <h3 className="pointer-card__title">{title}</h3>
                <p className="pointer-card__description">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
