import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './components/Homepage/pages';
import { validateLandingPage, generateSessionId, getSessionId } from './utils/api';
import { sendSegmentPageEvent, waitForAnalytics } from './utils/analytics';

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

function App() {
  const [validatedUrl, setValidatedUrl] = useState('');
  const [validatedParams, setValidatedParams] = useState({});
  const [geolocationReady, setGeolocationReady] = useState(false);

  // Request geolocation permission on page load
  useEffect(() => {
    const requestGeolocation = async () => {
      console.log('🌍 Geolocation: Starting request...');

      // Initialize with default "no" state before any action
      window.geolocationData = {
        geolocation_address: '',
        geolocation_lat: '',
        geolocation_long: '',
        geolocation_permission: 'user_disabled',
        geolocation_triggered: 'no'
      };

      if (!navigator.geolocation) {
        console.log('❌ Geolocation: Not supported by browser');
        window.geolocationData = {
          geolocation_address: '',
          geolocation_lat: '',
          geolocation_long: '',
          geolocation_permission: 'not_supported',
          geolocation_triggered: 'yes'
        };
        setGeolocationReady(true);
        return;
      }

      // Check permission status first using Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          console.log('🔐 Current permission state:', permissionStatus.state);

          if (permissionStatus.state === 'denied') {
            console.log('🚫 Geolocation: Permission already denied by user');
            window.geolocationData = {
              geolocation_address: '',
              geolocation_lat: '',
              geolocation_long: '',
              geolocation_permission: 'denied',
              geolocation_triggered: 'yes'
            };
            setGeolocationReady(true);
            return;
          }
        } catch (err) {
          console.log('⚠️ Could not check permission status:', err);
        }
      }

      console.log('🌍 Geolocation: Requesting position...');

      // Add small delay to ensure page is fully loaded
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Request current position - this triggers the permission prompt
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // User GRANTED permission
          console.log('✅ Geolocation: Permission granted', position.coords);
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get address from coordinates
          try {
            console.log('🗺️ Geolocation: Reverse geocoding coordinates...');
            const mapboxToken = 'pk.eyJ1IjoicmFtZWVuIiwiYSI6ImNtZ3VrdTR0eDBmbzYya3I3cjIwbnNzOHIifQ.YaGIyU6YCDj1c4MKJZahcA';
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=place,locality,neighborhood,address`
            );
            const data = await response.json();
            console.log('🗺️ Mapbox response:', data);

            if (data.features && data.features.length > 0) {
              // Get the most specific location available (could be address, place, or city)
              const addressText = data.features[0].place_name.replace(/, United States$/, '');
              console.log('✅ Geolocation: Address found:', addressText);
              console.log('📍 Location type:', data.features[0].place_type);

              // Update with successful geolocation data
              window.geolocationData = {
                geolocation_address: addressText,
                geolocation_lat: latitude.toString(),
                geolocation_long: longitude.toString(),
                geolocation_permission: 'granted',
                geolocation_triggered: 'yes'
              };

              console.log('✅ Geolocation: Data saved.');
              setGeolocationReady(true);
            } else {
              console.log('⚠️ Geolocation: No address found for coordinates');
              // Got coordinates but couldn't get address
              window.geolocationData = {
                geolocation_address: '',
                geolocation_lat: latitude.toString(),
                geolocation_long: longitude.toString(),
                geolocation_permission: 'granted',
                geolocation_triggered: 'yes'
              };
              setGeolocationReady(true);
            }
          } catch (error) {
            console.error('❌ Geolocation: Reverse geocoding failed', error);
            // Reverse geocoding failed
            window.geolocationData = {
              geolocation_address: '',
              geolocation_lat: latitude.toString(),
              geolocation_long: longitude.toString(),
              geolocation_permission: 'granted',
              geolocation_triggered: 'yes'
            };
            setGeolocationReady(true);
          }
        },
        (error) => {
          // User DENIED permission or other error occurred
          console.error('❌ Geolocation: Error', error);
          let permissionStatus = 'user_disabled';
          if (error.code === error.PERMISSION_DENIED) {
            permissionStatus = 'denied';
            console.log('🚫 Geolocation: Permission denied by user');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            permissionStatus = 'unavailable';
            console.log('⚠️ Geolocation: Position unavailable');
          } else if (error.code === error.TIMEOUT) {
            permissionStatus = 'timeout';
            console.log('⏱️ Geolocation: Request timeout');
          }

          window.geolocationData = {
            geolocation_address: '',
            geolocation_lat: '',
            geolocation_long: '',
            geolocation_permission: permissionStatus,
            geolocation_triggered: 'yes'
          };
          setGeolocationReady(true);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    requestGeolocation();
  }, []);

  // Validate landing page on mount - fire page event AFTER getting v3 data
  useEffect(() => {
    // Wait for geolocation to complete before validating landing page
    if (!geolocationReady) {
      return;
    }

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
        let actualValidatedUrl = apiUrl;
        let actualValidatedParams = {};

        try {
          result = await validateLandingPage(apiUrl);

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
              name: isValidParam(sourceData.name) ? sourceData.name : (isValidParam(actualValidatedParams.name) ? actualValidatedParams.name : ''),
              phone: isValidParam(sourceData.phone) ? sourceData.phone : (isValidParam(actualValidatedParams.phone) ? actualValidatedParams.phone : ''),
              email: isValidParam(sourceData.email) ? sourceData.email : (isValidParam(actualValidatedParams.email) ? actualValidatedParams.email : ''),
              address: isValidParam(sourceData.address) ? sourceData.address : (isValidParam(actualValidatedParams.address) ? actualValidatedParams.address : ''),
              street: isValidParam(sourceData.street) ? sourceData.street : (isValidParam(actualValidatedParams.street) ? actualValidatedParams.street : ''),
              city: isValidParam(sourceData.city) ? sourceData.city : (isValidParam(actualValidatedParams.city) ? actualValidatedParams.city : ''),
              state: isValidParam(sourceData.state) ? sourceData.state : (isValidParam(actualValidatedParams.state) ? actualValidatedParams.state : ''),
              zip: isValidParam(sourceData.zip) ? sourceData.zip : (isValidParam(actualValidatedParams.zip) ? actualValidatedParams.zip : ''),
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
          // Parse params from current URL since API failed (validate params)
          const currentParams = new URLSearchParams(window.location.search);
          const paramsObj = {};
          for (let [key, value] of currentParams) {
            // Only set param if it's valid, otherwise set to empty string
            paramsObj[key] = isValidParam(value) ? value : '';
          }
          setValidatedUrl(apiUrl);
          setValidatedParams(paramsObj);
        }

        // Track invalid fields and build validated URL
        const sessionId = getSessionId();
        const invalidFields = [];

        // Check each param and track if invalid
        const paramsToCheck = ['fname', 'lname', 'name', 'email', 'phone', 'street', 'city', 'state', 'zip', 'address'];
        paramsToCheck.forEach(param => {
          const value = urlParams.get(param);
          if (value && !isValidParam(value)) {
            invalidFields.push(param);
          }
        });

        // Build validated URL with empty values for invalid params
        const validatedUrlParamsNew = new URLSearchParams(urlParams);
        invalidFields.forEach(field => {
          validatedUrlParamsNew.set(field, ''); // Set invalid fields to empty
        });
        const builtValidatedUrl = `${window.location.origin}${window.location.pathname}?${validatedUrlParamsNew.toString()}`;

        // Extract identity API data from v3 response
        let identityApiData = {};
        if (result?.data?.[0]?._source) {
          const sourceData = result.data[0]._source;
          identityApiData = {
            ip: '', // IP would come from backend
            identity_api_source: 'address_internal',
            identity_api_res: result.data[0],
            identity_checkout_category: (sourceData.name && sourceData.email && sourceData.phone && sourceData.address)
              ? 'all_data_present'
              : 'partial_data',
          };
        }

        // Get current geolocation data
        const currentGeoData = window.geolocationData || null;

        // Fire page event with new analytics structure
        sendSegmentPageEvent(
          sessionId,
          invalidFields,
          builtValidatedUrl,
          currentGeoData,
          identityApiData
        );

        // Check if we should fire quiz events
        // Only fire if address exists in URL params OR v3 response
        const hasAddressInUrl = urlParams.get("address");
        const hasAddressInV3 = result?.data?.[0]?._source?.address;
        const shouldFireQuizEvents = hasAddressInUrl || hasAddressInV3;

        // Fire quiz_start and partial_quiz_submit events only if address is present
        if (shouldFireQuizEvents) {
          waitForAnalytics(() => {
            window.analytics.track("quiz_start", {
              ...identityApiData,
            });
            window.analytics.track("partial_quiz_submit", {
              ...identityApiData,
            });
          });
        }

        // Auto-redirect to HomeLight quiz with address from API response
        // Use address from v3/landing page API response, fallback to geolocation
        const addressForRedirect = result?.data?.[0]?._source?.address ||
                                   actualValidatedParams.address ||
                                   currentGeoData?.geolocation_address;

        if (addressForRedirect && isValidParam(addressForRedirect)) {
          const timestamp = Date.now();
          const encodedAddress = encodeURIComponent(addressForRedirect);
          const redirectUrl = `https://www.homelight.com/simple-sale/quiz?interested_in_agent=true&address=${encodedAddress}&timestamp=${timestamp}#/qaas=0/`;

          console.log('🔄 Auto-redirecting to:', redirectUrl);

          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        }
      } catch (error) {
        // Handle unexpected errors silently
      }
    };

    callValidateLandingPage();
  }, [geolocationReady]);

  return <HomePage validatedUrl={validatedUrl} validatedParams={validatedParams} />;
}

export default App;
