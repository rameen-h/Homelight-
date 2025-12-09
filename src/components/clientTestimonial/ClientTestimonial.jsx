import './ClientTestimonial.css';

const ClientTestimonial = () => {
  return (
    <div className="testimonials-background">
      <div className="section-area__container testimonials">
        <div className="testimonial-section__title">
          <h2 className="section__description section__description--text-wrap section__description--text-center section__description--default">
            What our clients are saying <br></br> about HomeLight Simple Sale<sup>®</sup>
          </h2>
        </div>

        <div className="testimonial-section__carousel">
          <div className="testimonial-boxes">
            {/* Testimonial 1 */}
            <div className="testimonial-container">
              <div className="card-container card-container--big">
                <div className="testimonial-card">
                  <picture className="testimonial-card__picture">
                    <img
                      src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/kevin_l-c2807382e3374f811d7da99497f1bb22.jpg"
                      alt="Picture of Kevin L."
                    />
                  </picture>
                  <span className="testimonial-card__author">Kevin L.</span>
                  <span className="testimonial-card__role">HomeLight Simple Sale Client</span>
                  <hr className="testimonial-card__divider" />
                  <p className="testimonial-card__content">
                    "From the initial phone consultation, to the closing of escrow, the entire process was so quick and simple. Everyone was extremely helpful, responsive, and professional."
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-container">
              <div className="card-container card-container--big">
                <div className="testimonial-card">
                  <picture className="testimonial-card__picture">
                    <img
                      src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/traci-8bd5aedcd79f5a31f5c6f162bb0c5f6b.jpg"
                      alt="Picture of Traci M."
                    />
                  </picture>
                  <span className="testimonial-card__author">Traci M.</span>
                  <span className="testimonial-card__role">HomeLight Simple Sale Client</span>
                  <hr className="testimonial-card__divider" />
                  <p className="testimonial-card__content">
                    "HomeLight Simple Sale helped match me with a cash buyer within days. The process was extremely easy and efficient. I would definitely recommend Simple Sale to anyone trying to sell their home."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTestimonial;
