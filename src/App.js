import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './components/Homepage/pages';
import { validateLandingPage, generateSessionId, getSessionId } from './utils/api';

function App() {
  const [validatedUrl, setValidatedUrl] = useState('');
  const [validatedParams, setValidatedParams] = useState({});

  // Validate landing page on mount - fire page event AFTER getting v3 data
  useEffect(() => {
    const callValidateLandingPage = async () => {
      // Generate session ID first (before everything else)
      const generatedSessionId = await generateSessionId();

      // Get current URL parameters
      try {
        const urlParams = new URLSearchParams(window.location.search);

        // Build production URL for API (replace localhost with production domain)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const productionDomain = 'https://example.com'; // Replace with your actual production domain
        const productionPath = '/winning-offer'; // Replace with your actual path

        const queryString = urlParams.toString();
        const apiUrl = isLocalhost
          ? `${productionDomain}${productionPath}${queryString ? '?' + queryString : ''}`
          : `${window.location.origin}${window.location.pathname}${queryString ? '?' + queryString : ''}`;

        let result;
        let apiSuccess = false;
        let actualValidatedUrl = apiUrl;
        let actualValidatedParams = {};

        try {
          result = await validateLandingPage(apiUrl);
          apiSuccess = true;

          // Extract the actual validated data from nested structure
          actualValidatedUrl = apiUrl;
          actualValidatedParams = {};

          if (result && result.data) {
            // API returns nested structure: { data: { validatedUrl, validatedParams } }
            actualValidatedUrl = result.data.validatedUrl || apiUrl;
            actualValidatedParams = result.data.validatedParams || {};
          } else if (result) {
            // Fallback to direct result
            actualValidatedUrl = result.validatedUrl || apiUrl;
            actualValidatedParams = result.validatedParams || result || {};
          }

          // Extract address data from v3 API response (data[0]._source)
          if (result?.data?.[0]?._source) {
            const sourceData = result.data[0]._source;
            actualValidatedParams = {
              ...actualValidatedParams,
              name: sourceData.name || actualValidatedParams.name || '',
              phone: sourceData.phone || actualValidatedParams.phone || '',
              email: sourceData.email || actualValidatedParams.email || '',
              address: sourceData.address || actualValidatedParams.address || '',
              street: sourceData.street || actualValidatedParams.street || '',
              city: sourceData.city || actualValidatedParams.city || '',
              state: sourceData.state || actualValidatedParams.state || '',
              zip: sourceData.zip || actualValidatedParams.zip || '',
            };
          }

          // Store the validated data in state
          setValidatedUrl(actualValidatedUrl);
          setValidatedParams(actualValidatedParams);

          // If API returns a validatedUrl, use it to update the browser URL
          if (actualValidatedUrl && actualValidatedUrl !== apiUrl) {
            // Parse the validated URL
            const validatedUrlObj = new URL(actualValidatedUrl);

            // If we're on localhost, use the query params from validatedUrl with local origin
            if (isLocalhost) {
              const newParams = validatedUrlObj.search;
              window.history.replaceState({}, '', `${window.location.pathname}${newParams}`);
            } else {
              // In production, we can use the full validatedUrl
              // Only update if the validatedUrl is different from current URL
              const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
              if (actualValidatedUrl !== currentUrl) {
                window.history.replaceState({}, '', actualValidatedUrl);
              }
            }
          }
        } catch (error) {
          // Set state with current URL even if API fails
          // Parse params from current URL since API failed
          const currentParams = new URLSearchParams(window.location.search);
          const paramsObj = {};
          for (let [key, value] of currentParams) {
            paramsObj[key] = value;
          }
          setValidatedUrl(apiUrl);
          setValidatedParams(paramsObj);
        }

        // Build pageData for segment events (will be used for both page and quiz events)
        let finalPageData;
        const sessionId = getSessionId();

        if (apiSuccess && result && result.data && result.data.validatedUrl) {
          // Parse validated URL to extract query params
          const validatedUrlObj = new URL(result.data.validatedUrl);
          const validatedUrlParams = new URLSearchParams(validatedUrlObj.search);

          // Build pageData using validated params from API response
          finalPageData = {
            // Page metadata
            path: window.location.pathname || '',
            referrer: document.referrer || '',
            search: window.location.search || '',
            title: document.title || '',
            url: window.location.href || '',
            category: window.location.href,
            name: "Simple Sale Cash Offer",

            // Platform and session
            source_platform: 'homelight',
            sessionId: sessionId || '',
            checkoutId: validatedUrlParams.get("checkoutId") || "28",
            experiment_id: validatedUrlParams.get("eid") || '28',
            utmContent: validatedUrlParams.get("utm_content") || sessionId || '',
            utmSource: validatedUrlParams.get("utm_source") || '',
            utmMedium: validatedUrlParams.get("utm_medium") || '',
            utmCampaign: validatedUrlParams.get("utm_campaign") || '',
            utmTerm: validatedUrlParams.get("utm_term") || '',

            // Prepopulated fields - merge URL params with v3 data
            prepop_email: validatedUrlParams.get("email") || actualValidatedParams.email || '',
            prepop_phone: validatedUrlParams.get("phone") || actualValidatedParams.phone || '',
            prepop_name: validatedUrlParams.get("name") || actualValidatedParams.name || '',
            prepop_address: validatedUrlParams.get("address") || actualValidatedParams.address || '',
            prepop_street: validatedUrlParams.get("street") || actualValidatedParams.street || '',
            prepop_city: validatedUrlParams.get("city") || actualValidatedParams.city || '',
            prepop_state: validatedUrlParams.get("state") || actualValidatedParams.state || '',
            prepop_zip: validatedUrlParams.get("zip") || actualValidatedParams.zip || '',
            prepop_fname: validatedUrlParams.get("fname") || '',
            prepop_lname: validatedUrlParams.get("lname") || '',

            // Status flags
            address_chosen: 'prepopulated',
            session_api_called: true,
            session_api_status: 'success',
            session_api_errorMessage: '',
            api_validation_success: true,
          };

          // Add any additional validated params from response
          if (result.data.validatedParams) {
            finalPageData = { ...finalPageData, ...result.data.validatedParams };
          }
        } else {
          // Use current browser URL params
          finalPageData = {
            // Page metadata
            path: window.location.pathname || '',
            referrer: document.referrer || '',
            search: window.location.search || '',
            title: document.title || '',
            url: window.location.href || '',
            category: window.location.href,
            name: "Simple Sale Cash Offer",

            // Platform and session
            source_platform: 'homelight',
            sessionId: sessionId || '',
            checkoutId: urlParams.get("checkoutId") || "28",
            experiment_id: urlParams.get("eid") || '28',
            utmContent: urlParams.get("utm_content") || '',
            utmSource: urlParams.get("utm_source") || '',
            utmMedium: urlParams.get("utm_medium") || '',
            utmCampaign: urlParams.get("utm_campaign") || '',
            utmTerm: urlParams.get("utm_term") || '',

            // Prepopulated fields
            prepop_email: urlParams.get("email") || '',
            prepop_phone: urlParams.get("phone") || '',
            prepop_name: urlParams.get("name") || '',
            prepop_address: urlParams.get("address") || '',
            prepop_street: urlParams.get("street") || '',
            prepop_city: urlParams.get("city") || '',
            prepop_state: urlParams.get("state") || '',
            prepop_zip: urlParams.get("zip") || '',
            prepop_fname: urlParams.get("fname") || '',
            prepop_lname: urlParams.get("lname") || '',

            // Status flags
            address_chosen: 'no',
            session_api_called: false,
            session_api_status: '',
            session_api_errorMessage: '',
            api_validation_success: false,
          };
        }

        // Fire page event ONCE with all prepop properties
        const firePageEvent = () => {
          if (window.analytics && typeof window.analytics.page === 'function') {
            window.analytics.page(window.location.href, "Simple Sale Cash Offer", finalPageData);
          } else {
            setTimeout(firePageEvent, 100);
          }
        };
        firePageEvent();

        // Check if we should fire quiz events
        // Only fire if address exists in URL params OR v3 response
        const hasAddressInUrl = urlParams.get("address");
        const hasAddressInV3 = result?.data?.[0]?._source?.address;
        const shouldFireQuizEvents = hasAddressInUrl || hasAddressInV3;

        // Fire quiz_start and partial_quiz_submit events only if address is present
        if (shouldFireQuizEvents) {
          const fireQuizEvents = () => {
            if (window.analytics && typeof window.analytics.track === 'function') {
              // Use the same pageData we built for the page event
              window.analytics.track("quiz_start", finalPageData);
              window.analytics.track("partial_quiz_submit", finalPageData);
            } else {
              setTimeout(fireQuizEvents, 100);
            }
          };
          fireQuizEvents();
        }
      } catch (error) {
        // Handle unexpected errors silently
      }
    };

    callValidateLandingPage();
  }, []);

  return <HomePage validatedUrl={validatedUrl} validatedParams={validatedParams} />;
}

export default App;
