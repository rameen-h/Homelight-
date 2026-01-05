import React, { useEffect, useRef, useState } from "react";
import "./heroSection.css";
import { buildPageData } from "../../utils/analytics";
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

const PromoSection = ({ validatedParams, validatedUrl }) => {
  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);
  const geocoderInputRef = useRef(null);
  const ctaWrapRef = useRef(null);
  const [prepopulatedAddress, setPrepopulatedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const originalParamsRef = useRef({}); // Store original params for comparison
  const addressChosenMethod = useRef("manual"); // Track if from dropdown or manual

  // Check for persisted session on mount
  useEffect(() => {
    const persistedSession = sessionStorage.getItem('thr_user_session');
    if (persistedSession) {
      try {
        const sessionData = JSON.parse(persistedSession);
        // Show loading state if user came back
        if (sessionData.isLoading) {
          setIsLoading(true);
          setPrepopulatedAddress(sessionData.address || '');
          console.log('🔄 Restored session from sessionStorage:', sessionData);

          // Auto-clear loading state after 60 seconds (user came back, so stop loading)
          setTimeout(() => {
            setIsLoading(false);
            sessionStorage.removeItem('thr_user_session');
            console.log('✅ Cleared loading state after user returned');
          }, 60000);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
  }, []);

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
      if (!ctaWrapRef.current) return;

      if (window.innerWidth <= 430) {
        const scrollY = window.scrollY || window.pageYOffset;
        const heroHeight = window.innerHeight * 0.6; // Show after scrolling 60% of viewport

        if (scrollY > heroHeight) {
          ctaWrapRef.current.classList.add('show-on-scroll');
        } else {
          ctaWrapRef.current.classList.remove('show-on-scroll');
        }
      } else {
        // Remove class when not on mobile view
        ctaWrapRef.current.classList.remove('show-on-scroll');

        // Clear loading state when switching to desktop view
        setIsLoading(false);
        sessionStorage.removeItem('thr_user_session');
      }
    };

    const handleResize = () => {
      handleScroll(); // Re-check on resize
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
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
      geocoder.on("result", async (e) => {
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

        // Call /v3 API with partial address to get name, phone, email
        let v3Data = null;
        try {
          console.log('🔍 Hero Dropdown - Calling /v3 API with address:', redirectAddress);
          const v3Response = await callPartialMatchApi({ address: redirectAddress });
          v3Data = v3Response?.data?.[0]?._source || null;
          console.log('✅ Hero Dropdown - /v3 API response:', v3Data);
        } catch (error) {
          console.error('❌ Hero Dropdown - /v3 API call failed:', error);
        }

        // Build redirect URL with name, email, phone from v3 API or fallback to validatedParams
        const timestamp = Date.now();

        console.log('🔍 Hero Dropdown - validatedParams:', validatedParams);

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
          console.log('✅ Hero Dropdown - Adding address:', redirectAddress);
          params.set('address', redirectAddress);
        }

        // Encode name, email, phone with Base64 for obfuscation
        if (name && isValidParam(name)) {
          const encoded = btoa(name);
          console.log('✅ Hero Dropdown - Adding encoded name:', encoded);
          params.set('n', encoded);
        }
        if (phone && isValidParam(phone)) {
          const encoded = btoa(phone);
          console.log('✅ Hero Dropdown - Adding encoded phone:', encoded);
          params.set('p', encoded);
        }
        if (email && isValidParam(email)) {
          const encoded = btoa(email);
          console.log('✅ Hero Dropdown - Adding encoded email:', encoded);
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
        console.log('🔄 Hero Dropdown - Redirecting directly to HomeLight:', navUrl);

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

      // Validate the full address before using it
      if (fullAddress && !isValidParam(fullAddress)) {
        console.log('🚫 Invalid full address detected, ignoring:', fullAddress);
        fullAddress = '';
      }

      if (!fullAddress) {
        // Build address from individual parts, but validate each part first
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
        if (street && !validStreet) console.log('🚫 Invalid street detected, ignoring:', street);
        if (city && !validCity) console.log('🚫 Invalid city detected, ignoring:', city);
        if (state && !validState) console.log('🚫 Invalid state detected, ignoring:', state);
        if (zip && !validZip) console.log('🚫 Invalid zip detected, ignoring:', zip);

        // Store original params for comparison (only if valid)
        originalParamsRef.current = {
          street: validStreet,
          city: validCity,
          state: validState,
          zip: validZip
        };

        const addressParts = [validStreet, validCity, validState, validZip].filter(Boolean);
        fullAddress = addressParts.join(', ');
      }

      if (fullAddress) {
        // Remove "United States" from the address
        fullAddress = fullAddress.replace(/,?\s*United States\s*$/i, '').trim();
        geocoderInputRef.current.value = fullAddress;
        addressChosenMethod.current = "prepopulated";
        console.log('✅ Address prepopulated:', fullAddress);
      } else {
        console.log('ℹ️ No valid address to prepopulate');
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
                onClick={async (e) => {
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

                  // Call /v3 API with partial address to get name, phone, email
                  let v3Data = null;
                  try {
                    console.log('🔍 Hero Button - Calling /v3 API with address:', redirectAddress);
                    const v3Response = await callPartialMatchApi({ address: redirectAddress });
                    v3Data = v3Response?.data?.[0]?._source || null;
                    console.log('✅ Hero Button - /v3 API response:', v3Data);
                  } catch (error) {
                    console.error('❌ Hero Button - /v3 API call failed:', error);
                  }

                  // Build redirect URL with name, email, phone from v3 API or fallback to validatedParams
                  const timestamp = Date.now();

                  console.log('🔍 Hero Button - validatedParams:', validatedParams);

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
                    console.log('✅ Hero Button - Adding address:', redirectAddress);
                    params.set('address', redirectAddress);
                  }

                  // Encode name, email, phone with Base64 for obfuscation
                  if (name && isValidParam(name)) {
                    const encoded = btoa(name);
                    console.log('✅ Hero Button - Adding encoded name:', encoded);
                    params.set('n', encoded);
                  }
                  if (phone && isValidParam(phone)) {
                    const encoded = btoa(phone);
                    console.log('✅ Hero Button - Adding encoded phone:', encoded);
                    params.set('p', encoded);
                  }
                  if (email && isValidParam(email)) {
                    const encoded = btoa(email);
                    console.log('✅ Hero Button - Adding encoded email:', encoded);
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
                  console.log('🔄 Hero Button - Redirecting directly to HomeLight:', navUrl);

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
                  "Get my offers"
                )}
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
