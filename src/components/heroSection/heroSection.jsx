import React, { useEffect, useRef, useState } from "react";
import "./heroSection.css";
import { buildPageData } from "../../utils/analytics";

const PromoSection = ({ validatedParams, validatedUrl }) => {
  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);
  const geocoderInputRef = useRef(null);
  const ctaWrapRef = useRef(null);
  const [prepopulatedAddress, setPrepopulatedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const originalParamsRef = useRef({}); // Store original params for comparison
  const addressChosenMethod = useRef("manual"); // Track if from dropdown or manual

  // Safe Segment event tracker
  const trackEvent = (eventName, data) => {
    if (!window.analytics) {
      setTimeout(() => trackEvent(eventName, data), 100);
      return;
    }
    window.analytics.ready(() => {
      window.analytics.track(eventName, data);
    });
  };

  // Scroll listener for showing/hiding CTA on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 430 && ctaWrapRef.current) {
        const scrollY = window.scrollY || window.pageYOffset;
        const heroHeight = window.innerHeight * 0.6; // Show after scrolling 60% of viewport

        if (scrollY > heroHeight) {
          ctaWrapRef.current.classList.add('show-on-scroll');
        } else {
          ctaWrapRef.current.classList.remove('show-on-scroll');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Effect to handle loading of Mapbox and prepopulating the address
  useEffect(() => {
    const loadMapbox = async () => {
      // Load Mapbox scripts and CSS if not loaded
      if (!window.mapboxgl || !window.MapboxGeocoder) {
        await new Promise((resolve) => {
          const script1 = document.createElement("script");
          script1.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
          script1.onload = resolve;
          document.body.appendChild(script1);
        });

        await new Promise((resolve) => {
          const script2 = document.createElement("script");
          script2.src =
            "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.min.js";
          script2.onload = resolve;
          document.body.appendChild(script2);
        });

        const link1 = document.createElement("link");
        link1.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
        link1.rel = "stylesheet";
        document.head.appendChild(link1);

        const link2 = document.createElement("link");
        link2.href =
          "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.css";
        link2.rel = "stylesheet";
        document.head.appendChild(link2);
      }

      // Set Mapbox token
      window.mapboxgl.accessToken =
        "pk.eyJ1IjoicmFtZWVuIiwiYSI6ImNtZ3VrdTR0eDBmbzYya3I3cjIwbnNzOHIifQ.YaGIyU6YCDj1c4MKJZahcA";

      const geocoder = new window.MapboxGeocoder({
        accessToken: window.mapboxgl.accessToken,
        placeholder: "Enter property address",
        countries: "us",
        types: "address",
        marker: false,
        flyTo: false,
        autocomplete: false,
        render: function(item) {
          const placeName = item.place_name.replace(/, United States$/, '');
          return `<div class='mapboxgl-ctrl-geocoder--suggestion'><div class='mapboxgl-ctrl-geocoder--suggestion-title'>${placeName}</div></div>`;
        }
      });
      geocoderRef.current = geocoder;

      // Set geolocation proximity
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            geocoder.setProximity({ longitude, latitude });
          },
          () => {}
        );
      }

      // Set prepopulated address if passed via validatedParams
      if (validatedParams?.address) {
        setPrepopulatedAddress(validatedParams.address);
      }

      // Address selection
      geocoder.on("result", (e) => {
        // Mark that user selected from dropdown
        addressChosenMethod.current = "dropdown";

        if (geocoderInputRef.current) {
          geocoderInputRef.current.value = geocoderInputRef.current.value.replace(/, United States$/, '');
        }

        const pageData = buildPageData();
        pageData.address_chosen = 'dropdown';
        pageData.prepop_address = e.result.place_name;

        trackEvent("partial_quiz_submit", pageData);
        trackEvent("quiz_start", pageData);

        // Show loading state
        setIsLoading(true);

        // Build redirect URL with selected address
        const context = e.result.context || [];
        const addressText = e.result.address
          ? `${e.result.address} ${e.result.text}`
          : e.result.text;
        const city = context.find((c) => c.id.startsWith("place"))?.text || "";
        const state = context.find((c) => c.id.startsWith("region"))?.text || "";
        const zip = context.find((c) => c.id.startsWith("postcode"))?.text || "";

        // Determine redirect address
        let redirectAddress;
        const originalParams = originalParamsRef.current;

        // Check if user changed the prepopulated address
        const hasOriginalParams = originalParams && originalParams.street;
        const addressChanged = hasOriginalParams && (
          originalParams.street !== addressText ||
          originalParams.city !== city ||
          originalParams.state !== state ||
          originalParams.zip !== zip
        );

        if (addressChanged || !hasOriginalParams) {
          // User selected a new/different address
          redirectAddress = e.result.place_name.replace(/, United States$/, '');
        } else {
          // User selected same prepopulated address, use original URL params
          const origParts = [
            originalParams.street,
            originalParams.city,
            originalParams.state,
            originalParams.zip
          ].filter(Boolean);
          redirectAddress = origParts.join(', ');
        }

        // Build redirect URL
        const timestamp = Date.now();
        const encodedAddress = encodeURIComponent(redirectAddress);
        const navUrl = `https://www.homelight.com/simple-sale/quiz?interested_in_agent=true?&address=${encodedAddress}&timestamp=${timestamp}#/qaas=0/`;

        // Small delay to show loading state
        setTimeout(() => {
          window.location.href = navUrl;
        }, 300);
      });

      // Attach geocoder to container
      if (geocoderContainerRef.current && geocoderContainerRef.current.childNodes.length === 0) {
        geocoder.addTo(geocoderContainerRef.current);
        geocoderInputRef.current = geocoderContainerRef.current.querySelector("input.mapboxgl-ctrl-geocoder--input");

        // Position suggestions to match search bar width (including button)
        const positionSuggestions = () => {
          const autocompleteBox = document.querySelector('.autocomplete-box.geocoder-control');
          const suggestions = geocoderContainerRef.current?.querySelector('.suggestions, .mapbox-place-autocomplete ul');

          if (autocompleteBox && suggestions) {
            const rect = autocompleteBox.getBoundingClientRect();
            suggestions.style.position = 'absolute';
            suggestions.style.width = `${rect.width}px`;
            suggestions.style.left = '0';
            suggestions.style.top = '100%';
            suggestions.style.marginTop = '4px';
          }
        };

        // Position on results
        geocoder.on('results', positionSuggestions);

        // Reposition on window resize
        window.addEventListener('resize', positionSuggestions);
      }
    };

    loadMapbox();

    return () => {
      if (geocoderRef.current && geocoderContainerRef.current) {
        try {
          geocoderRef.current.clear();
          geocoderRef.current.onRemove && geocoderRef.current.onRemove();
          geocoderContainerRef.current.innerHTML = "";
        } catch (_) {}
      }
    };
  }, [validatedParams]);

  // Prepopulate address when component loads
  useEffect(() => {
    if (validatedParams && Object.keys(validatedParams).length > 0 && geocoderInputRef.current) {
      // Try to get full address first, or build from parts
      let fullAddress = validatedParams.address || validatedParams.prepop_address || '';

      if (!fullAddress) {
        // Build address from individual parts
        const street = validatedParams.street || validatedParams.prepop_street || '';
        const city = validatedParams.city || validatedParams.prepop_city || '';
        const state = validatedParams.state || validatedParams.prepop_state || '';
        const zip = validatedParams.zip || validatedParams.prepop_zip || '';

        // Store original params for comparison
        originalParamsRef.current = { street, city, state, zip };

        const addressParts = [street, city, state, zip].filter(Boolean);
        fullAddress = addressParts.join(', ');
      }

      if (fullAddress) {
        // Remove "United States" from the address
        fullAddress = fullAddress.replace(/,?\s*United States\s*$/i, '').trim();
        geocoderInputRef.current.value = fullAddress;
        addressChosenMethod.current = "prepopulated";
      }
    }
  }, [validatedParams]);

  return (
    <section className="promo-section__wrapper">
      <div className="promo-section__content">
        <h1 className="title">Who will win? Who can<br />close in 7 days?</h1>
        <div className="description">
          Compare the top real estate agents and the largest investor network to get the best price and close fast.
        </div>
        <div className="cta-wrap" ref={ctaWrapRef}>
          <div className="autocomplete-wrapper">
            <div className="autocomplete-box geocoder-control">
              <div id="hero-input" ref={geocoderContainerRef} />
              <a
                className="btn-primary"
                id="hero-cta"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const addressValue = geocoderInputRef.current?.value?.trim();

                  if (!addressValue) {
                    geocoderInputRef.current.style.border = "2px solid red";
                    setTimeout(() => {
                      alert("Please enter your address.");
                      geocoderInputRef.current.style.border = "";
                    }, 200);
                    return false;
                  }

                  const pageData = buildPageData();
                  pageData.button_text = "Get my offers";
                  if (!pageData.address_chosen || pageData.address_chosen === "no") {
                    pageData.address_chosen = addressChosenMethod.current;
                  }
                  pageData.prepop_address = addressValue;

                  trackEvent("partial_quiz_submit", pageData);
                  trackEvent("quiz_start", pageData);

                  setIsLoading(true);

                  // Determine which address to use for redirect
                  let redirectAddress;
                  const originalParams = originalParamsRef.current;

                  // Check if user manually typed or if they used the prepopulated value
                  if (addressChosenMethod.current === "manual") {
                    // User manually typed the address
                    redirectAddress = addressValue;
                  } else if (addressChosenMethod.current === "dropdown") {
                    // User selected from dropdown - use the new selected address
                    redirectAddress = addressValue;
                  } else if (addressChosenMethod.current === "prepopulated" && originalParams.street) {
                    // User didn't change prepopulated address - use original URL params
                    const origParts = [
                      originalParams.street,
                      originalParams.city,
                      originalParams.state,
                      originalParams.zip
                    ].filter(Boolean);
                    redirectAddress = origParts.join(', ');
                  } else {
                    // Fallback to current value
                    redirectAddress = addressValue;
                  }

                  // Build redirect URL
                  const timestamp = Date.now();
                  const encodedAddress = encodeURIComponent(redirectAddress);
                  const navUrl = `https://www.homelight.com/simple-sale/quiz?interested_in_agent=true?&address=${encodedAddress}&timestamp=${timestamp}#/qaas=0/`;
                  window.location.href = navUrl;
                }}
                disabled={isLoading}
              >
                {isLoading ? "Loading" : "Get my offers"}
              </a>
            </div>
          </div>
        </div>
      </div>
      <picture>
        <source
          media="(min-width: 1024px)"
          srcSet="https://d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/hero-simple-sale-compare-ae0a456c2f5c09d2213f717b97c57132.webp"
        />
        <img
          alt="Hero image"
          src="https://d1xt9s86fx9r45.cloudfront.net/assets/hl-production/packs/media/images/productsLandingPages/simpleSale/hero-simple-sale-compare-mobile-c1d3b133722484d17bfdbad78d13a051.webp"
          loading="eager"
        />
      </picture>
    </section>
  );
};

export default PromoSection;
