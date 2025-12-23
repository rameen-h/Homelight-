import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './components/Homepage/pages';
import { validateLandingPage, generateSessionId, getSessionId } from './utils/api';
import { buildPageData } from './utils/analytics';

function App() {
  const [validatedUrl, setValidatedUrl] = useState('');
  const [validatedParams, setValidatedParams] = useState({});

  // Validate landing page on mount - AFTER page event fires
  useEffect(() => {
    const callValidateLandingPage = async () => {
      // Generate session ID first (before everything else)
      const generatedSessionId = await generateSessionId();

      // Wait for analytics to be ready and send page event first
      await new Promise((resolve) => {
        const checkAnalytics = () => {
          if (window.analytics && typeof window.analytics.page === 'function') {
            // Send page view first with session ID
            const pageData = {
              source_platform: 'homelight',
              sessionId: generatedSessionId || '',
              checkoutId: new URLSearchParams(window.location.search).get("checkoutId") || "28",
              experiment_id: new URLSearchParams(window.location.search).get("eid") || '28',
            };
            window.analytics.page(window.location.href, "Simple Sale Cash Offer", pageData);
            resolve();
          } else {
            setTimeout(checkAnalytics, 100);
          }
        };
        checkAnalytics();
      });

      // Now call landing page API after page event
      try {
        // Get current URL parameters
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

        try {
          result = await validateLandingPage(apiUrl);
          apiSuccess = true;

          // Extract the actual validated data from nested structure
          let actualValidatedUrl = apiUrl;
          let actualValidatedParams = {};

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

        // Fire quiz_start and partial_quiz_submit events regardless of API success
        // This ensures events fire with prepopulated data even if API is unavailable
        const fireQuizEvents = () => {
          if (window.analytics && typeof window.analytics.track === 'function') {
            // Build page data from validated URL or current URL
            let pageData;
            const sessionId = getSessionId();

            if (apiSuccess && result && result.data && result.data.validatedUrl) {
              // Parse validated URL to extract query params
              const validatedUrlObj = new URL(result.data.validatedUrl);
              const validatedUrlParams = new URLSearchParams(validatedUrlObj.search);

              // Build pageData using validated params from API response
              pageData = {
                source_platform: 'homelight',
                sessionId: sessionId || '',
                checkoutId: validatedUrlParams.get("checkoutId") || "28",
                utmContent: validatedUrlParams.get("utm_content") || sessionId || '',
                experiment_id: validatedUrlParams.get("eid") || '28',
                utmSource: validatedUrlParams.get("utm_source") || '',
                utmMedium: validatedUrlParams.get("utm_medium") || '',
                utmCampaign: validatedUrlParams.get("utm_campaign") || '',
                utmTerm: validatedUrlParams.get("utm_term") || '',
                prepop_email: validatedUrlParams.get("email") || '',
                prepop_phone: validatedUrlParams.get("phone") || '',
                prepop_name: validatedUrlParams.get("name") || '',
                prepop_address: validatedUrlParams.get("address") || '',
                prepop_street: validatedUrlParams.get("street") || '',
                prepop_city: validatedUrlParams.get("city") || '',
                prepop_state: validatedUrlParams.get("state") || '',
                prepop_zip: validatedUrlParams.get("zip") || '',
                prepop_fname: validatedUrlParams.get("fname") || '',
                prepop_lname: validatedUrlParams.get("lname") || '',
                address_chosen: 'prepopulated',
                session_api_called: true,
                session_api_status: 'success',
                session_api_errorMessage: '',
                api_validation_success: true,
              };

              // Add any additional validated params from response
              if (result.data.validatedParams) {
                pageData = { ...pageData, ...result.data.validatedParams };
              }
            } else {
              // Use current browser URL params
              pageData = buildPageData();
              pageData.sessionId = sessionId || '';
              pageData.address_chosen = 'default_params';
              pageData.api_validation_success = false;
            }

            window.analytics.track("quiz_start", pageData);
            window.analytics.track("partial_quiz_submit", pageData);
          } else {
            setTimeout(fireQuizEvents, 100);
          }
        };

        // Fire events after processing (successful or not)
        fireQuizEvents();
      } catch (error) {
        // Handle unexpected errors silently
      }
    };

    callValidateLandingPage();
  }, []);

  return <HomePage validatedUrl={validatedUrl} validatedParams={validatedParams} />;
}

export default App;
