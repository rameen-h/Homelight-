import { useEffect, useRef, useState } from "react";
import "./search.css";
import { trackButtonClick, trackEvent, buildPageData, waitForAnalytics } from "../../utils/analytics";
import { callPartialMatchApi } from "../../utils/api";

// Validate if a parameter is "real" (not placeholder/empty)
function isValidParam(val) {
  if (!val || typeof val !== 'string') return false;
  val = decodeURIComponent(val.trim());

  // Reject placeholders, empty, or HTML-like values
  if (val === '' || val.startsWith('<') || val.endsWith('>') || val.includes('PLACEHOLDER') || val.includes('placeholder')) {
    return false;
  }

  // Reject values that are wrapped in angle brackets (e.g., <FNAME>, <EMAIL>)
  if (val.match(/^<[A-Z_]+>$/i)) {
    return false;
  }

  return true;
}

const Search = ({ validatedUrl, validatedParams }) => {
  const searchGeocoderContainerRef = useRef(null);
  const searchGeocoderRef = useRef(null);
  const searchGeocoderInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const addressChosenMethod = useRef("manual"); // Track if from dropdown or manual
  const originalParamsRef = useRef({}); // Store original params for comparison

  // Check for persisted session on mount
  useEffect(() => {
    const persistedSession = sessionStorage.getItem('thr_user_session');
    if (persistedSession) {
      try {
        const sessionData = JSON.parse(persistedSession);
        // Show loading state if user came back
        if (sessionData.isLoading) {
          setIsLoading(true);
          console.log('🔄 Search - Restored session from sessionStorage:', sessionData);

          // Auto-clear loading state after 60 seconds (user came back, so stop loading)
          setTimeout(() => {
            setIsLoading(false);
            sessionStorage.removeItem('thr_user_session');
            console.log('✅ Search - Cleared loading state after user returned');
          }, 60000);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
  }, []);

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
          () => {}
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

      geocoder.on("result", async (e) => {
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

        // Call /v3 API with partial address to get name, phone, email
        let v3Data = null;
        try {
          console.log('🔍 Search Dropdown - Calling /v3 API with address:', redirectAddress);
          const v3Response = await callPartialMatchApi({ address: redirectAddress });
          v3Data = v3Response?.data?.[0]?._source || null;
          console.log('✅ Search Dropdown - /v3 API response:', v3Data);
        } catch (error) {
          console.error('❌ Search Dropdown - /v3 API call failed:', error);
        }

        // Build redirect URL with name, email, phone from v3 API or fallback to validatedParams
        const timestamp = Date.now();

        // Build query params - preserve existing URL params (UTM, session ID, etc.)
        const params = new URLSearchParams(window.location.search);
        params.set('interested_in_agent', 'true');
        params.set('timestamp', timestamp);

        // Prefer v3Data, fallback to validatedParams
        const name = v3Data?.name || validatedParams?.name || '';
        const email = v3Data?.email || validatedParams?.email || '';
        const phone = v3Data?.phone || validatedParams?.phone || '';

        // Add address as plain text (not encoded)
        if (redirectAddress) {
          console.log('✅ Search Dropdown - Adding address:', redirectAddress);
          params.set('address', redirectAddress);
        }

        // Encode name, email, phone with Base64 for obfuscation
        if (name && isValidParam(name)) {
          const encoded = btoa(name);
          console.log('✅ Search Dropdown - Adding encoded name:', encoded);
          params.set('n', encoded);
        }
        if (phone && isValidParam(phone)) {
          const encoded = btoa(phone);
          console.log('✅ Search Dropdown - Adding encoded phone:', encoded);
          params.set('p', encoded);
        }
        if (email && isValidParam(email)) {
          const encoded = btoa(email);
          console.log('✅ Search Dropdown - Adding encoded email:', encoded);
          params.set('e', encoded);
        }

        // Save session data before redirect
        try {
          sessionStorage.setItem('thr_user_session', JSON.stringify({
            address: redirectAddress,
            name: name,
            email: email,
            phone: phone,
            isLoading: true,
            timestamp: timestamp,
            method: 'dropdown'
          }));
          console.log('💾 Saved session to sessionStorage');
        } catch (e) {
          console.warn('Could not save session:', e);
        }

        // Direct redirect to HomeLight (no intermediate page)
        const navUrl = `https://www.homelight.com/simple-sale/quiz?${params.toString()}#/qaas=0/`;
        console.log('🔄 Search Dropdown - Redirecting directly to HomeLight:', navUrl);

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
    if (validatedParams && Object.keys(validatedParams).length > 0 && searchGeocoderInputRef.current) {
      // Try to get full address first, or build from parts
      let fullAddress = validatedParams.address || validatedParams.prepop_address || '';

      // Validate the full address before using it
      if (fullAddress && !isValidParam(fullAddress)) {
        console.log('🚫 Search: Invalid full address detected, ignoring:', fullAddress);
        fullAddress = '';
      }

      if (!fullAddress) {
        // Build address string from validated params, but validate each part first
        const street = validatedParams.street || validatedParams.prepop_street || '';
        const city = validatedParams.city || validatedParams.prepop_city || '';
        const state = validatedParams.state || validatedParams.prepop_state || '';
        const zip = validatedParams.zip || validatedParams.prepop_zip || '';

        // Validate each part before using
        const validStreet = isValidParam(street) ? street : '';
        const validCity = isValidParam(city) ? city : '';
        const validState = isValidParam(state) ? state : '';
        const validZip = isValidParam(zip) ? zip : '';

        // Log any invalid parts
        if (street && !validStreet) console.log('🚫 Search: Invalid street detected, ignoring:', street);
        if (city && !validCity) console.log('🚫 Search: Invalid city detected, ignoring:', city);
        if (state && !validState) console.log('🚫 Search: Invalid state detected, ignoring:', state);
        if (zip && !validZip) console.log('🚫 Search: Invalid zip detected, ignoring:', zip);

        // Store original params for later comparison (only if valid)
        originalParamsRef.current = {
          street: validStreet,
          city: validCity,
          state: validState,
          zip: validZip
        };

        // Only prepopulate if at least one address field is present
        const addressParts = [validStreet, validCity, validState, validZip].filter(Boolean);
        fullAddress = addressParts.join(', ');
      }

      if (fullAddress) {
        // Remove "United States" from the address
        fullAddress = fullAddress.replace(/,?\s*United States\s*$/i, '').trim();
        searchGeocoderInputRef.current.value = fullAddress;
        addressChosenMethod.current = "prepopulated";
        console.log('✅ Search: Address prepopulated:', fullAddress);
      } else {
        console.log('ℹ️ Search: No valid address to prepopulate');
      }
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
              onClick={async (e) => {
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

                // Call /v3 API with partial address to get name, phone, email
                let v3Data = null;
                try {
                  console.log('🔍 Search Button - Calling /v3 API with address:', redirectAddress);
                  const v3Response = await callPartialMatchApi({ address: redirectAddress });
                  v3Data = v3Response?.data?.[0]?._source || null;
                  console.log('✅ Search Button - /v3 API response:', v3Data);
                } catch (error) {
                  console.error('❌ Search Button - /v3 API call failed:', error);
                }

                // Build redirect URL with name, email, phone from v3 API or fallback to validatedParams
                const timestamp = Date.now();

                console.log('🔍 Search validatedParams:', validatedParams);

                // Build query params
                const params = new URLSearchParams();
                params.set('interested_in_agent', 'true');
                params.set('timestamp', timestamp);

                // Prefer v3Data, fallback to validatedParams
                const name = v3Data?.name || validatedParams?.name || '';
                const email = v3Data?.email || validatedParams?.email || '';
                const phone = v3Data?.phone || validatedParams?.phone || '';

                // Add address as plain text (not encoded)
                if (redirectAddress) {
                  console.log('✅ Search Button - Adding address:', redirectAddress);
                  params.set('address', redirectAddress);
                }

                // Encode name, email, phone with Base64 for obfuscation
                if (name && isValidParam(name)) {
                  const encoded = btoa(name);
                  console.log('✅ Search Button - Adding encoded name:', encoded);
                  params.set('n', encoded);
                }
                if (phone && isValidParam(phone)) {
                  const encoded = btoa(phone);
                  console.log('✅ Search Button - Adding encoded phone:', encoded);
                  params.set('p', encoded);
                }
                if (email && isValidParam(email)) {
                  const encoded = btoa(email);
                  console.log('✅ Search Button - Adding encoded email:', encoded);
                  params.set('e', encoded);
                }

                // Save session data before redirect
                try {
                  sessionStorage.setItem('thr_user_session', JSON.stringify({
                    address: redirectAddress,
                    name: name,
                    email: email,
                    phone: phone,
                    isLoading: true,
                    timestamp: timestamp,
                    method: 'button'
                  }));
                  console.log('💾 Saved session to sessionStorage');
                } catch (e) {
                  console.warn('Could not save session:', e);
                }

                // Direct redirect to HomeLight (no intermediate page)
                const navUrl = `https://www.homelight.com/simple-sale/quiz?${params.toString()}#/qaas=0/`;
                console.log('✅ Search Button - Redirecting directly to HomeLight:', navUrl);

                window.location.href = navUrl;
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner-wrapper">
                  <span className="loading-spinner"></span>
                  <span>Loading...</span>
                </span>
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
