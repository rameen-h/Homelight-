import React, { useEffect, useRef } from "react";
import "./heroSection.css";
import { buildPageData } from "../../utils/analytics";

const PromoSection = () => {
  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);
  const geocoderInputRef = useRef(null);

  // Safe Segment event tracker
  const trackEvent = (eventName, data) => {
    if (!window.analytics) {
      console.warn("⚠️ Segment not loaded yet, retrying...");
      setTimeout(() => trackEvent(eventName, data), 100);
      return;
    }
    window.analytics.ready(() => {
      console.log(`🔵 Sending Segment event: ${eventName}`, data);
      window.analytics.track(eventName, data);
    });
  };

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
          (err) => console.warn("Geolocation failed or denied:", err)
        );
      }

      // Address selection
      geocoder.on("result", (e) => {
        console.log("🏠 Selected address:", e.result);

        if (geocoderInputRef.current) {
          geocoderInputRef.current.value = geocoderInputRef.current.value.replace(/, United States$/, '');
        }

        const pageData = buildPageData();
        pageData.address_chosen = 'dropdown';
        pageData.prepop_address = e.result.place_name;

        trackEvent("partial_quiz_submit", pageData);
        trackEvent("quiz_start", pageData);
      });

      // Remove active suggestion styles
      geocoder.on("results", () => {
        if (geocoderContainerRef.current) {
          const removeActiveStyles = () => {
            const allSuggestions = geocoderContainerRef.current.querySelectorAll(".mapboxgl-ctrl-geocoder--suggestion");
            allSuggestions.forEach((s) => {
              s.classList.remove("active");
              s.style.background = "#ffffff";
            });
          };
          removeActiveStyles();
          setTimeout(removeActiveStyles, 10);
        }
      });

      // Attach geocoder to container
      if (geocoderContainerRef.current && geocoderContainerRef.current.childNodes.length === 0) {
        geocoder.addTo(geocoderContainerRef.current);
        geocoderInputRef.current = geocoderContainerRef.current.querySelector("input.mapboxgl-ctrl-geocoder--input");
      }
    };

    const handleOutside = (evt) => {
      const container = geocoderContainerRef.current;
      if (!container) return;
      if (!container.contains(evt.target)) {
        if (geocoderInputRef.current) geocoderInputRef.current.blur();
        const suggestions = container.querySelector(".suggestions");
        if (suggestions) suggestions.style.display = "none";
      }
    };

    loadMapbox();

    document.addEventListener("click", handleOutside, true);
    document.addEventListener("touchstart", handleOutside, true);

    return () => {
      document.removeEventListener("click", handleOutside, true);
      document.removeEventListener("touchstart", handleOutside, true);
      if (geocoderRef.current && geocoderContainerRef.current) {
        try {
          geocoderRef.current.clear();
          geocoderRef.current.onRemove && geocoderRef.current.onRemove();
          geocoderContainerRef.current.innerHTML = "";
        } catch (_) {}
      }
    };
  }, []);

  return (
    <section className="promo-section__wrapper">
      <div className="promo-section__content">
        <h1 className="title">Who will win? Who can<br />close in 7 days?</h1>
        <div className="description">
          Compare the top real estate agents and the largest investor network to get the best price and close fast.
        </div>
        <div className="cta-wrap">
          <div className="autocomplete-wrapper">
            <div className="autocomplete-box geocoder-control">
              <div id="hero-input" ref={geocoderContainerRef} />
              <a className="btn-primary" id="hero-cta" href="#">Get my offers</a>
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
