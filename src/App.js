import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './components/Homepage/pages';
import useAnalytics from './hooks/useAnalytics';
import { validateLandingPage } from './utils/api';
import { buildPageData } from './utils/analytics';

function App() {
  const [validatedUrl, setValidatedUrl] = useState('');
  const [validatedParams, setValidatedParams] = useState({});

  // Validate landing page on mount - AFTER page event fires
  useEffect(() => {
    const callValidateLandingPage = async () => {
      // Wait for analytics to be ready and send page event first
      await new Promise((resolve) => {
        const checkAnalytics = () => {
          if (window.analytics && typeof window.analytics.page === 'function') {
            // Send page view first
            const pageData = {
              source_platform: 'homelight',
              sessionId: '',
              checkoutId: new URLSearchParams(window.location.search).get("checkoutId") || "28",
              experiment_id: new URLSearchParams(window.location.search).get("eid") || '28',
            };
            console.log('🔵 Tracking Page View:', pageData);
            window.analytics.page(window.location.href, "Simple Sale Cash Offer", pageData);
            console.log('✅ Page View Sent to Segment');
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

        // Check if URL has any parameters
        const hasParams = urlParams.toString() !== '';
        if (!hasParams) {
          console.log('📍 No query parameters found, proceeding without defaults');
        } else {
          console.log('📍 Using existing query parameters from URL:', urlParams.toString());
        }

        // Build production URL for API (replace localhost with production domain)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const productionDomain = 'https://example.com'; // Replace with your actual production domain
        const productionPath = '/winning-offer'; // Replace with your actual path

        const queryString = urlParams.toString();
        const apiUrl = isLocalhost
          ? `${productionDomain}${productionPath}${queryString ? '?' + queryString : ''}`
          : `${window.location.origin}${window.location.pathname}${queryString ? '?' + queryString : ''}`;

        console.log('📍 Sending to API:', apiUrl);

        let result;
        let apiSuccess = false;

        try {
          result = await validateLandingPage(apiUrl);
          console.log('✅ Landing page validation successful:', result);
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

          console.log('📦 Extracted validatedUrl:', actualValidatedUrl);
          console.log('📦 Extracted validatedParams:', actualValidatedParams);

          // Store the validated data in state
          setValidatedUrl(actualValidatedUrl);
          setValidatedParams(actualValidatedParams);

          // If API returns a validatedUrl, use it to update the browser URL
          if (actualValidatedUrl && actualValidatedUrl !== apiUrl) {
            console.log('🔄 Received validated URL from API:', actualValidatedUrl);

            // Parse the validated URL
            const validatedUrlObj = new URL(actualValidatedUrl);

            // If we're on localhost, use the query params from validatedUrl with local origin
            if (isLocalhost) {
              const newParams = validatedUrlObj.search;
              window.history.replaceState({}, '', `${window.location.pathname}${newParams}`);
              console.log('✅ Updated localhost URL with validated params:', newParams);
            } else {
              // In production, we can use the full validatedUrl
              // Only update if the validatedUrl is different from current URL
              const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
              if (actualValidatedUrl !== currentUrl) {
                window.history.replaceState({}, '', actualValidatedUrl);
                console.log('✅ Updated production URL to:', actualValidatedUrl);
              }
            }
          }
        } catch (error) {
          console.error('❌ Landing page validation failed:', error);
          console.log('ℹ️ Continuing with URL parameters from current page');
          // Set state with current URL even if API fails
          // Parse params from current URL since API failed
          const currentParams = new URLSearchParams(window.location.search);
          const paramsObj = {};
          for (let [key, value] of currentParams) {
            paramsObj[key] = value;
          }
          setValidatedUrl(apiUrl);
          setValidatedParams(paramsObj);
          console.log('📦 Setting validated params from current URL:', paramsObj);
        }

        // Fire quiz_start and partial_quiz_submit events regardless of API success
        // This ensures events fire with prepopulated data even if API is unavailable
        const fireQuizEvents = () => {
          if (window.analytics && typeof window.analytics.track === 'function') {
            // Build page data from validated URL or current URL
            let pageData;

            if (apiSuccess && result && result.data && result.data.validatedUrl) {
              // Parse validated URL to extract query params
              const validatedUrlObj = new URL(result.data.validatedUrl);
              const validatedUrlParams = new URLSearchParams(validatedUrlObj.search);

              // Build pageData using validated params from API response
              pageData = {
                source_platform: 'homelight',
                sessionId: '',
                checkoutId: validatedUrlParams.get("checkoutId") || "28",
                utmContent: validatedUrlParams.get("utm_content") || '',
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
              pageData.address_chosen = 'default_params';
              pageData.api_validation_success = false;
            }

            console.log('🔵 Firing quiz events with data:', pageData);

            window.analytics.track("quiz_start", pageData);
            console.log('✅ quiz_start event sent');

            window.analytics.track("partial_quiz_submit", pageData);
            console.log('✅ partial_quiz_submit event sent');
          } else {
            console.warn('⚠️ Analytics not ready, retrying...');
            setTimeout(fireQuizEvents, 100);
          }
        };

        // Fire events after processing (successful or not)
        fireQuizEvents();
      } catch (error) {
        console.error('❌ Unexpected error in landing page flow:', error);
      }
    };

    callValidateLandingPage();
  }, []);

  return <HomePage validatedUrl={validatedUrl} validatedParams={validatedParams} />;
}

export default App;
