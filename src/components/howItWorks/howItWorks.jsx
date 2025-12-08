import { useState, useEffect, useRef } from 'react';
import './howItWorks.css';

const HowItWorks = () => {
  const [activeSteps, setActiveSteps] = useState([]);
  const stepRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      const newActiveSteps = [];

      stepRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // If step is in viewport (with some offset for better UX)
          if (rect.top < windowHeight * 0.8) {
            newActiveSteps.push(index + 1);
          }
        }
      });

      setActiveSteps(newActiveSteps);
    };

    handleScroll(); // Check on mount
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isStepActive = (stepNumber) => activeSteps.includes(stepNumber);

  return (
    <div className="how-it-works-simple-sale-compare section-area__container">
      <div className="how-it-works-container">
        {/* Header Section */}
        <div className="heading">
          <div className="section__title">4 EASY STEPS</div>
          <h2 className="section__description section__description--text-nowrap section__description--text-center section__description--default">
            How HomeLight <br className="mobile-break" />Simple Sale<sup>®</sup> Works
          </h2>
          <div className="how-it-works-container__detailed_description">
            Compare the top real estate agents and the largest investor network to get the best price and close fast.
          </div>
        </div>

        {/* Process Steps */}
        <div className="how-it-works-container__process-step">
          
          {/* Step 1 */}
          <div className="step-wrapper">
            <div className={`step-number ${isStepActive(1) ? 'active' : ''}`} ref={el => stepRefs.current[0] = el}>1</div>
            <div className="process-step__step">
              <div className="icon">
                <img
                  src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/components/icons/female-agent-6d9cb9b7ed725bc9330cc11c9442ae2c.png"
                  alt="step icon"
                />
              </div>
              <div className="desc">
                <h3>Tell us about your home and speak to a Home Consultant</h3>
                <p>This helps us get the best possible offer from our investors for your home.</p>
              </div>
            </div>
          </div>

          {/* Connector Line 1 */}
          <div className="step-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="64" viewBox="0 0 2 64" fill="none" className="line-top">
              <path d="M1 0L1 64" stroke="url(#paint0_linear_step2)" strokeWidth="2"></path>
              <defs>
                <linearGradient id="paint0_linear_step2" x1="1.5" y1="0" x2="1.5" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#46B6FF" stopOpacity="0"></stop>
                  <stop offset="1" stopColor="#46B6FF"></stop>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Step 2 */}
            <div className={`step-number ${isStepActive(2) ? 'active' : ''}`} ref={el => stepRefs.current[1] = el}>2</div>
            <div className="process-step__step">
              <div className="icon">
                <img
                  src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/components/icons/home-search-e62b5a3ac516a60f572f481221054c49.png"
                  alt="step icon"
                />
              </div>
              <div className="desc">
                <h3>We use your local neighborhood data</h3>
                <p>We'll use our local expert's evaluation and our pricing model to determine the best price for your home.</p>
              </div>
            </div>
          </div>

          {/* Split Step (Investors vs Agents) */}
          <div className="step-wrapper split-step">
            {/* Desktop Line */}
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="64" viewBox="0 0 2 64" fill="none" className="line-top">
              <path d="M1 0L1 64" stroke="url(#paint0_linear_step3)" strokeWidth="2"></path>
              <defs>
                <linearGradient id="paint0_linear_step3" x1="1.5" y1="0" x2="1.5" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#46B6FF" stopOpacity="0"></stop>
                  <stop offset="1" stopColor="#46B6FF"></stop>
                </linearGradient>
              </defs>
            </svg>

            {/* Mobile Line */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="137" viewBox="0 0 32 137" fill="none" className="line-top-mobile">
              <circle cx="16" cy="121" r="16" fill="#D0ECFF"></circle>
              <circle cx="16" cy="121" r="8" fill="#46B6FF"></circle>
              <path d="M16 0L16 116" stroke="url(#paint0_linear_mobile)" strokeWidth="2"></path>
              <defs>
                <linearGradient id="paint0_linear_mobile" x1="16.5" y1="0" x2="16.5" y2="116" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#46B6FF" stopOpacity="0"></stop>
                  <stop offset="1" stopColor="#46B6FF"></stop>
                </linearGradient>
              </defs>
            </svg>

            {/* Step 3 - Single centered number */}
            <div className={`step-number ${isStepActive(3) ? 'active' : ''}`} ref={el => stepRefs.current[2] = el}>3</div>

            {/* Split Paths */}
            <div className="split-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="272" height="114" viewBox="0 0 272 114" fill="none" className="split-path split-path-left">
                <path d="M271 1C270.327 20.6972 252.125 60.0917 184.701 60.0917C100.421 60.0917 4.53272 55.2538 1.00001 100.868V114" stroke="#46B6FF" strokeWidth="2"></path>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="272" height="114" viewBox="0 0 272 114" fill="none" className="split-path split-path-right">
                <path d="M271 1C270.327 20.6972 252.125 60.0917 184.701 60.0917C100.421 60.0917 4.53272 55.2538 1.00001 100.868V114" stroke="#46B6FF" strokeWidth="2"></path>
              </svg>
            </div>

            {/* Investors vs Agents Section */}
            <div className="investors-vs-agents-step">
              <div className="investors-vs-agents-title">
                <div className="vs-title">Investors</div>
                <div className="vs-circle">VS</div>
                <div className="vs-title">Agents</div>
              </div>

              <div className="step-split-wrapper">
                <div className="vs-section investor-vs-section">
                  <div className="text-wrapper">
                    <h3>Talk to investors</h3>
                    <div className="vs-description">
                      Investors can help you sell your home for a competitive price in as few as 10 days,
                      with no additional fees, agent commission, or prep‑work.
                    </div>
                  </div>
                  <div className="logos">
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/investor-ocean-city-e31adcaa7aadcda286498fc1904aaa0b.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/investor-sundae-3b4dcf442c42cddf24b6382b8bae54dc.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/investor-abi-298f2880a24392016e4ec2f8ed590b18.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/investor-tricon-16f255f330a41d01b937a34138a0fef8.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/investor-homego-b719ec1be03d512133e74043cd98432a.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/investor-homevestors-3fb45f31ee486106f5df9a8f9099d53e.png" alt="logo" />
                    </div>
                  </div>
                </div>

                {/* Agents Section */}
                <div className="vs-section agent-vs-section">
                  <div className="text-wrapper">
                    <h3>Talk to agents</h3>
                    <div className="vs-description">
                      Agents can get you top dollar in your local market by listing your home.
                    </div>
                  </div>
                  <div className="logos">
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/agent-weichert-c731d7b67939d0076e03e765ededd1b1.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/agent-long-and-foster-91466736de5f19bfd684587d1de75f4e.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/agent-exp-0934e00c3575df80f9566de2751b9ddd.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/agent-sothebys-4fdf1a7f3ebab8f0fa41fc584a7fcfa3.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/agent-prudential-85ab4b32f9130dc61ba608a72438005b.png" alt="logo" />
                    </div>
                    <div className="logo-wrapper">
                      <img src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/agent-realty-one-fc1daee8c565c004f1c2c6bf58918931.png" alt="logo" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="step-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="64" viewBox="0 0 2 64" fill="none" className="line-top">
              <path d="M1 0L1 64" stroke="url(#paint0_linear_step4)" strokeWidth="2"></path>
              <defs>
                <linearGradient id="paint0_linear_step4" x1="1.5" y1="0" x2="1.5" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#46B6FF" stopOpacity="0"></stop>
                  <stop offset="1" stopColor="#46B6FF"></stop>
                </linearGradient>
              </defs>
            </svg>
            
            <div className={`step-number ${isStepActive(4) ? 'active' : ''}`} ref={el => stepRefs.current[3] = el}>4</div>
            <div className="process-step__step">
              <div className="icon">
                <img
                  src="//d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/components/icons/cash-b773a84789521953cac0fce23ac8d8f7.png"
                  alt="step icon"
                />
              </div>
              <div className="desc">
                <h3>Accept the top offer and get ready for your move</h3>
                <p>Receive multiple offers and get the best deal for your home.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HowItWorks;