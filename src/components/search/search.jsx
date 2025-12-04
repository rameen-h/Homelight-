import { useEffect, useRef } from "react";
import "./search.css";

const Search = () => {
  const searchGeocoderContainerRef = useRef(null);
  const searchGeocoderRef = useRef(null);
  const searchGeocoderInputRef = useRef(null);

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

      geocoder.on("result", (e) => {
        console.log("Selected address:", e.result);
      });

      if (searchGeocoderContainerRef.current && searchGeocoderContainerRef.current.childNodes.length === 0) {
        geocoder.addTo(searchGeocoderContainerRef.current);

        // Cache the input element for blur-on-outside
        searchGeocoderInputRef.current =
          searchGeocoderContainerRef.current.querySelector("input.mapboxgl-ctrl-geocoder--input");
      }
    };

    const handleOutside = (evt) => {
      const container = searchGeocoderContainerRef.current;
      if (!container) return;

      // If click/touch is outside the geocoder, close suggestions by blurring input.
      if (!container.contains(evt.target)) {
        if (searchGeocoderInputRef.current) searchGeocoderInputRef.current.blur();

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

      if (searchGeocoderRef.current && searchGeocoderContainerRef.current) {
        try {
          searchGeocoderRef.current.clear();
          searchGeocoderRef.current.onRemove && searchGeocoderRef.current.onRemove();
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

            <a href="#" className="ss-button ss-explore-btn">
              Get estimate
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
