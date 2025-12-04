import React from "react";
import "./clientStories.css"; // Link to the CSS file

const clientStories = [
  {
    videoSrc: "https://d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/testimonial-bao-w-cf59538fe38458d19d69fbb2ec5f3bb7.webp", // Video link
    quote:
      "My experience with HomeLight was quick, seamless, and offered the flexibility I needed to live in the condo I sold until I was able to move into my other home. By providing an all-cash offer with a quick and flexible closing date, they were able to make things very easy for me to move forward with my life.",
    clientName: "Bao W.",
    clientRole: "HomeLight Simple Sale Client",
  },
  // Add more stories here if needed
];

const ClientStories = () => {
  return (
    <div className="client-stories-section">
      <div className="client-stories-container">
        <div className="client-stories-title">Client Stories</div>
        <div className="client-stories-subtitle">Take their word for it</div>
        <div className="client-testimonial">
          {clientStories.map((story, index) => (
            <div key={index} className="testimonial-item">
              <img
                src={story.videoSrc}
                alt="Client testimonial video"
                className="testimonial-item__video"
              />
              <div className="testimonial-item__text">
                <div className="testimonial-item__quote">
                  “{story.quote}”
                </div>
                <div className="testimonial-item__source">
                  <span className="testimonial-item__source-name">
                    {story.clientName}
                  </span>
                  <br></br>
                  <span className="testimonial-item__source-role">
                    {story.clientRole}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientStories;
