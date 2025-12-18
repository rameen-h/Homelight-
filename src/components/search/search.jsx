import { useEffect, useRef, useState } from "react";
import "./search.css";
import { trackButtonClick, trackEvent, buildPageData, waitForAnalytics } from "../../utils/analytics";

const Search = ({ validatedUrl, validatedParams }) => {
  const searchGeocoderContainerRef = useRef(null);
  const searchGeocoderRef = useRef(null);
  const searchGeocoderInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const addressChosenMethod = useRef("manual"); // Track if from dropdown or manual
  const originalParamsRef = useRef({}); // Store original params for comparison

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
        render: function (item) {
          const placeName = item.place_name.replace(/, United States$/, "");
          return `<div class='mapboxgl-ctrl-geocoder--suggestion'><div class='mapboxgl-ctrl-geocoder--suggestion-title'>${placeName}</div></div>`;
        },
      });
      searchGeocoderRef.current = geocoder;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            geocoder.setProximity({ longitude, latitude });
          },
          (err) => console.warn("Geolocation failed or denied:", err)
        );
      }

      if (
        searchGeocoderContainerRef.current &&
        searchGeocoderContainerRef.current.childNodes.length === 0
      ) {
        geocoder.addTo(searchGeocoderContainerRef.current);
        searchGeocoderInputRef.current =
          searchGeocoderContainerRef.current.querySelector(
            "input.mapboxgl-ctrl-geocoder--input"
          );

        // Position suggestions to match search bar width
        const positionSuggestions = () => {
          const ctaArea = document.querySelector('.ss-cta-area');
          const addressWrap = document.querySelector('.ss-address-wrap');
          const suggestions = searchGeocoderContainerRef.current?.querySelector('.suggestions, .mapbox-place-autocomplete ul');

          if (ctaArea && addressWrap && suggestions) {
            const ctaRect = ctaArea.getBoundingClientRect();
            const wrapRect = addressWrap.getBoundingClientRect();

            suggestions.style.position = 'absolute';
            suggestions.style.width = `${ctaRect.width}px`;
            suggestions.style.left = `${ctaRect.left - wrapRect.left}px`;
            suggestions.style.top = '100%';
            suggestions.style.marginTop = '4px';
          }
        };

        // Position on results
        geocoder.on('results', positionSuggestions);

        // Reposition on window resize
        window.addEventListener('resize', positionSuggestions);
      }

      geocoder.on("result", (e) => {
        const context = e.result.context || [];
        const addressParts = {
          street: e.result.address
            ? `${e.result.address} ${e.result.text}`
            : e.result.text,
          city: context.find((c) => c.id.startsWith("place"))?.text || "",
          state: context.find((c) => c.id.startsWith("region"))?.text || "",
          zip: context.find((c) => c.id.startsWith("postcode"))?.text || "",
        };

        // Check if user changed the prepopulated address
        const originalParams = originalParamsRef.current;
        const hasOriginalParams = originalParams && originalParams.street;
        const addressChanged = hasOriginalParams && (
          originalParams.street !== addressParts.street ||
          originalParams.city !== addressParts.city ||
          originalParams.state !== addressParts.state ||
          originalParams.zip !== addressParts.zip
        );

        if (addressChanged) {
          console.log('✏️ User changed prepopulated address via dropdown');
        }

        addressChosenMethod.current = "dropdown";

        const pageData = buildPageData();
        pageData.address_chosen = "dropdown";
        pageData.prepop_address = e.result.place_name;
        pageData.prepop_street = addressParts.street;
        pageData.prepop_city = addressParts.city;
        pageData.prepop_state = addressParts.state;
        pageData.prepop_zip = addressParts.zip;

        waitForAnalytics(() => {
          trackEvent("address_selected", pageData);
          window.analytics.track("partial_quiz_submit", pageData);
          window.analytics.track("quiz_start", pageData);
        });

        // Remove "United States" from input
        setTimeout(() => {
          const inputElement =
            searchGeocoderInputRef.current ||
            searchGeocoderContainerRef.current?.querySelector(
              "input.mapboxgl-ctrl-geocoder--input"
            );
          if (inputElement) {
            inputElement.value = inputElement.value.replace(
              /, United States$/,
              ""
            );
          }
        }, 0);

        // Show loading state
        setIsLoading(true);

        // Determine redirect address
        let redirectAddress;

        if (addressChanged || !hasOriginalParams) {
          // User selected a new/different address
          redirectAddress = e.result.place_name.replace(/, United States$/, '');
          console.log('📋 Dropdown selection - using new address for redirect');
        } else {
          // User selected same prepopulated address, use original URL params
          const origParts = [
            originalParams.street,
            originalParams.city,
            originalParams.state,
            originalParams.zip
          ].filter(Boolean);
          redirectAddress = origParts.join(', ');
          console.log('📌 Same prepopulated address - using original URL params');
        }

        // Build redirect URL
        const timestamp = Date.now();
        const encodedAddress = encodeURIComponent(redirectAddress);
        const navUrl = `https://www.homelight.com/simple-sale/quiz?interested_in_agent=true?&address=${encodedAddress}&timestamp=${timestamp}#/qaas=0/`;

        console.log('🚀 Redirecting to:', navUrl);

        // Small delay to show loading state
        setTimeout(() => {
          window.location.href = navUrl;
        }, 300);
      });
    };

    loadMapbox();

    return () => {
      window.removeEventListener('resize', () => {});
      if (searchGeocoderRef.current && searchGeocoderContainerRef.current) {
        try {
          searchGeocoderRef.current.clear();
          searchGeocoderRef.current.onRemove &&
            searchGeocoderRef.current.onRemove();
          searchGeocoderContainerRef.current.innerHTML = "";
        } catch (_) {}
      }
    };
  }, []);

  // Prepopulate address from validated params only if address-related params exist
  useEffect(() => {
    console.log('🔍 Search validatedParams:', validatedParams);
    console.log('🔍 Search searchGeocoderInputRef.current:', searchGeocoderInputRef.current);

    if (validatedParams && Object.keys(validatedParams).length > 0 && searchGeocoderInputRef.current) {
      // Build address string from validated params
      const street = validatedParams.street || validatedParams.prepop_street || '';
      const city = validatedParams.city || validatedParams.prepop_city || '';
      const state = validatedParams.state || validatedParams.prepop_state || '';
      const zip = validatedParams.zip || validatedParams.prepop_zip || '';

      // Store original params for later comparison
      originalParamsRef.current = { street, city, state, zip };

      // Only prepopulate if at least one address field is present
      const addressParts = [street, city, state, zip].filter(Boolean);
      if (addressParts.length > 0) {
        const fullAddress = addressParts.join(', ');
        searchGeocoderInputRef.current.value = fullAddress;
        addressChosenMethod.current = "prepopulated";
        console.log('🏠 Prepopulated Search address:', fullAddress);
      } else {
        console.log('⚠️ No address parts found in validatedParams - leaving search bar empty');
      }
    } else {
      console.log('⚠️ No validatedParams or search input not ready - leaving search bar empty');
    }
  }, [validatedParams]);

  return (
    <div className="simple-sale-blue-ribbon hide-on-quiz-start">
      <div className="simple-sale-blue-ribbon__content">
        <div className="simple-sale-blue-ribbon__header-text">
          See your estimated offer now
        </div>

        <div className="simple-sale-blue-ribbon__cta-wrap">
          <div className="ss-cta-area">
            <div className="ss-address-wrap">
              <div className="ss-address-inner ss-geocoder-control">
                <div id="search-input" ref={searchGeocoderContainerRef} />
              </div>
            </div>

            <a
              href="#"
              className="ss-button ss-explore-btn"
              onClick={(e) => {
                e.preventDefault();
                const addressValue =
                  searchGeocoderInputRef.current?.value?.trim();
                if (!addressValue) {
                  searchGeocoderInputRef.current.style.border =
                    "2px solid red";
                  setTimeout(() => {
                    alert("Please enter your address.");
                    searchGeocoderInputRef.current.style.border = "";
                  }, 200);
                  return false;
                }

                const pageData = buildPageData();
                pageData.button_text = "Get estimate";
                if (!pageData.address_chosen || pageData.address_chosen === "no") {
                  pageData.address_chosen = addressChosenMethod.current;
                }
                pageData.prepop_address = addressValue;

                waitForAnalytics(() => {
                  trackButtonClick("Get estimate", pageData);
                  window.analytics.track("partial_quiz_submit", pageData);
                  window.analytics.track("quiz_start", pageData);
                });

                setIsLoading(true);

                // Determine which address to use for redirect
                let redirectAddress;
                const originalParams = originalParamsRef.current;

                // Check if user manually typed or if they used the prepopulated value
                if (addressChosenMethod.current === "manual") {
                  // User manually typed the address
                  redirectAddress = addressValue;
                  console.log('⌨️ Manual entry - using typed address for redirect');
                } else if (addressChosenMethod.current === "dropdown") {
                  // User selected from dropdown - use the new selected address
                  redirectAddress = addressValue;
                  console.log('📋 Dropdown selection - using new address for redirect');
                } else if (addressChosenMethod.current === "prepopulated" && originalParams.street) {
                  // User didn't change prepopulated address - use original URL params
                  const origParts = [
                    originalParams.street,
                    originalParams.city,
                    originalParams.state,
                    originalParams.zip
                  ].filter(Boolean);
                  redirectAddress = origParts.join(', ');
                  console.log('📌 Prepopulated address unchanged - using original URL params');
                } else {
                  // Fallback to current value
                  redirectAddress = addressValue;
                  console.log('🔄 Fallback - using current address value');
                }

                // Build redirect URL
                const timestamp = Date.now();
                const encodedAddress = encodeURIComponent(redirectAddress);
                const navUrl = `https://www.homelight.com/simple-sale/quiz?interested_in_agent=true?&address=${encodedAddress}&timestamp=${timestamp}#/qaas=0/`;

                console.log('🚀 Redirecting to:', navUrl);
                window.location.href = navUrl;
              }}
              disabled={isLoading}
            >
              {isLoading ? "Loading" : "Get estimate"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
