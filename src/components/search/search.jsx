import { useEffect, useRef, useState } from "react";
import "./search.css";
import { trackButtonClick, trackEvent, buildPageData, waitForAnalytics } from "../../utils/analytics";

const Search = () => {
  const searchGeocoderContainerRef = useRef(null);
  const searchGeocoderRef = useRef(null);
  const searchGeocoderInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const addressChosenMethod = useRef("manual"); // Track if from dropdown or manual

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

        // Commented out auto-click for testing
        // setTimeout(() => {
        //   const button = document.querySelector(".ss-explore-btn");
        //   if (button) button.click();
        // }, 300);
      });
    };

    loadMapbox();

    return () => {
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

                // Navigation commented out for testing
                // const timestamp = Date.now();
                // const encodedAddress = encodeURIComponent(addressValue);
                // const navUrl = `https://www.homelight.com/simple-sale/quiz?interested_in_agent=true?&address=${encodedAddress}&timestamp=${timestamp}#/qaas=0/`;
                // window.location.href = navUrl;
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  style={{
                    width: "20px",
                    height: "20px",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  <path
                    fill="currentColor"
                    d="M287.1 64C181.1 64 95.1 149.1 95.1 256C95.1 362 181.1 448 287.1 448C358.1 448 419.3 410.5 452.9 354.4L453 354.5C446.1 369.4 451.5 387.3 465.1 395.7C481.3 404.6 500.9 399.3 509.7 384C509.9 383.7 510.1 383.4 510.2 383.1C466.1 460.1 383.1 512 288 512C146.6 512 32 397.4 32 256C32 114.6 146.6 0 288 0C270.3 0 256 14.33 256 32C256 49.67 270.3 64 288 64H287.1z"
                  ></path>
                </svg>
              ) : (
                "Get estimate"
              )}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
