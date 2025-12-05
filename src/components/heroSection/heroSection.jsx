import React, { useEffect, useRef } from "react";
import "./heroSection.css";

const PromoSection = () => {
  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);
  const geocoderInputRef = useRef(null);

  useEffect(() => {
    const loadMapbox = async () => {
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

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            geocoder.setProximity({ longitude, latitude });
          },
          (err) => console.warn("Geolocation failed or denied:", err)
        );
      }

      geocoder.on("result", (e) => {
        console.log("Selected address:", e.result);
        // Remove "United States" from the input field after selection
        if (geocoderInputRef.current) {
          const currentValue = geocoderInputRef.current.value;
          geocoderInputRef.current.value = currentValue.replace(/, United States$/, '');
        }
      });

      // Remove active state from first suggestion when results appear
      geocoder.on("results", () => {
        // Run immediately
        if (geocoderContainerRef.current) {
          const removeActiveStyles = () => {
            // Remove active class from all suggestions and force white background
            const allSuggestions = geocoderContainerRef.current.querySelectorAll(".mapboxgl-ctrl-geocoder--suggestion");
            allSuggestions.forEach((suggestion) => {
              suggestion.classList.remove("active");
              suggestion.removeAttribute("aria-selected");
              // Force white background with inline styles
              suggestion.style.backgroundColor = "#ffffff";
              suggestion.style.background = "#ffffff";
              suggestion.style.border = "none";
              suggestion.style.boxShadow = "none";
              suggestion.style.outline = "none";
            });

            // Remove active class from parent list items and force transparent background
            const allListItems = geocoderContainerRef.current.querySelectorAll(".suggestions li");
            allListItems.forEach((li) => {
              li.classList.remove("active");
              li.style.backgroundColor = "transparent";
              li.style.background = "transparent";
              li.style.border = "none";
              li.style.boxShadow = "none";
              li.style.outline = "none";
              li.style.margin = "0";
              li.style.padding = "0";
            });
          };

          removeActiveStyles();
          // Also run after a short delay in case Mapbox re-applies styles
          setTimeout(removeActiveStyles, 10);
        }
      });

      if (geocoderContainerRef.current && geocoderContainerRef.current.childNodes.length === 0) {
        geocoder.addTo(geocoderContainerRef.current);

        // Cache the input element for blur-on-outside
        geocoderInputRef.current =
          geocoderContainerRef.current.querySelector("input.mapboxgl-ctrl-geocoder--input");
      }
    };

    const handleOutside = (evt) => {
      const container = geocoderContainerRef.current;
      if (!container) return;

      // If click/touch is outside the geocoder, close suggestions by blurring input.
      if (!container.contains(evt.target)) {
        if (geocoderInputRef.current) geocoderInputRef.current.blur();

        // Fallback: force-hide suggestions if still visible
        const suggestions = container.querySelector(".suggestions");
        if (suggestions) suggestions.style.display = "none";
      }
    };

    loadMapbox();

    // Capture phase to catch early (helps when other handlers stop propagation)
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
        <h1 class="title">Who will win? Who can
          <br></br>
        close in 7 days?</h1>
        <div className="description">
          Compare the top real estate agents and the largest investor network to get the best price and close fast.
        </div>

        <div className="cta-wrap">
          <div className="autocomplete-wrapper">
            <div className="autocomplete-box geocoder-control">
              <div id="hero-input" ref={geocoderContainerRef} />
              <a className="btn-primary" id="hero-cta" href="#">
                Get my offers
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
