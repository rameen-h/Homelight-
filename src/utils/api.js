/**
 * API utility functions for HomeLight application
 */

const API_BASE_URL = 'https://api.palisade.ai';

/**
 * Validate if a parameter is "real" (not placeholder/empty)
 * @param {string} val - The value to validate
 * @returns {boolean} True if valid, false if invalid/placeholder
 */
const isValidParam = (val) => {
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
};

/**
 * Call partial match API for additional information
 * @param {Object} params - Parameters for the partial match API
 * @returns {Promise<Object>} Response from partial match API
 */
export const callPartialMatchApi = async (params) => {
  const queryParams = new URLSearchParams();

  if (params.address) queryParams.set('address', params.address);
  if (params.name) queryParams.set('name', params.name);
  if (params.phone) queryParams.set('phone', params.phone);
  if (params.email) queryParams.set('email', params.email);

  const apiUrl = `${API_BASE_URL}/checkout/v3/search/partial-match?${queryParams.toString()}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Partial match API call failed with status: ${response.status}`);
  }

  const data = await response.json();

  // If API returns error about missing parameters, return empty result instead
  if (data?.error && data?.message?.includes('Please provide at least one search parameter')) {
    return { data: [] };
  }

  return data;
};

/**
 * Generate session ID - only creates new session when tab is reopened
 * Session ID is stored in sessionStorage so it persists during page navigation
 * but is cleared when tab is closed
 * @returns {Promise<string|null>} Session ID or null if generation fails
 */
export const generateSessionId = async () => {
  // Check if session ID already exists in sessionStorage (persists during tab session)
  const savedSessionId = sessionStorage.getItem('alysonSessionId');
  if (savedSessionId) {
    // Ensure URL parameters are set with existing session ID
    const parser = new URL(window.location.href);
    const searchParams = parser.searchParams;

    // Update URL parameters with session ID
    searchParams.set('utm_content', savedSessionId);
    searchParams.set('sessionId', savedSessionId);
    searchParams.set('d', '1');
    searchParams.set('checkoutId', '28');

    const newUrl = `${parser.origin}${parser.pathname}?${searchParams.toString()}${parser.hash}`;
    window.history.replaceState({}, '', newUrl);

    return savedSessionId;
  }

  // No saved session - generate new one (happens when tab is reopened)
  const pageUrl = window.location.href;
  const apiUrl = `${API_BASE_URL}/api/alyson-session/params`;
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgwLCJpYXQiOjE3NDQ3MTY0MTksImV4cCI6MTc0NDgwMjgxOX0.DZKeID0-j3lv6JU7PS_v6fgEocLK9aqdDXSbK0i7t_M';

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const payload = JSON.stringify({ pageUrl });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-auth-token': authToken,
        'Content-Type': 'application/json',
      },
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Session API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    const sessionId = data?.data?.[0]?.alyson_session_id;

    if (!sessionId) {
      throw new Error('Missing sessionId in response');
    }

    // Save sessionId (will be cleared when tab is closed)
    window.alysonSessionId = sessionId;
    sessionStorage.setItem('alysonSessionId', sessionId);

    // Update URL parameters - utm_content and sessionId are the same
    const parser = new URL(window.location.href);
    const searchParams = parser.searchParams;
    searchParams.set('utm_content', sessionId);
    searchParams.set('sessionId', sessionId);
    searchParams.set('d', '1');
    searchParams.set('checkoutId', '28');

    const newUrl = `${parser.origin}${parser.pathname}?${searchParams.toString()}${parser.hash}`;
    window.history.replaceState({}, '', newUrl);

    return sessionId;
  } catch (error) {
    return null;
  }
};

/**
 * Get current session ID for segment tracking
 * @returns {string|null} Current session ID or null
 */
export const getSessionId = () => {
  return sessionStorage.getItem('alysonSessionId') || window.alysonSessionId || null;
};

/**
 * Validate landing page by sending URL parameters to backend
 * @param {string} currentUrl - The current page URL with query parameters
 * @returns {Promise<Object>} Response from the API
 */
export const validateLandingPage = async (currentUrl) => {
  try {
    // Use current URL with all query parameters
    let urlToSend = currentUrl || window.location.href;

    // If geolocation is enabled and has address, inject it into the URL
    const geoData = window?.geolocationData || null;
    const hasGeolocationAddress = geoData?.geolocation_permission === 'granted' && geoData?.geolocation_address;

    if (hasGeolocationAddress) {
      const urlObj = new URL(urlToSend);
      urlObj.searchParams.set('address', geoData.geolocation_address);
      urlToSend = urlObj.toString();
    }

    const response = await fetch(`${API_BASE_URL}/checkout/prepop/v2/validate/landing-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: urlToSend,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Set identity API source based on _index field (keep original source name)
    if (data?.data?.[0]) {
      const indexName = data.data[0]._index;
      data.identity_api_source = indexName === "data_axle" ? "address_dataaxle" : "address_internal";

      // Store the identity response
      window.identityResp = data.data[0];
      data.identity_api_res = window.identityResp;

      // Set initial identity checkout category
      const source = data.data[0]._source || {};
      data.identity_checkout_category =
        (source.name && source.email && source.phone)
          ? "all_data_present"
          : "partial_data_present";
    }

    // Parse URL parameters to check for invalid/placeholder values
    const urlParams = new URLSearchParams(new URL(urlToSend).search);

    // Check if any URL parameters contain invalid/placeholder values
    const paramsToCheck = ['fname', 'lname', 'name', 'email', 'phone', 'street', 'city', 'state', 'zip', 'address'];
    const hasInvalidParams = paramsToCheck.some(param => {
      const value = urlParams.get(param);
      // Check if param exists in URL (even if empty) and is invalid
      return value !== null && !isValidParam(value);
    });

    // Check if landing page API response has incomplete data
    // Call v3 if missing any of name, phone, or email
    const source = data?.data?.[0]?._source || {};
    const hasName = source.name && source.name.trim() !== '';
    const hasPhone = source.phone && source.phone.trim() !== '';
    const hasEmail = source.email && source.email.trim() !== '';
    const hasAllFields = hasName && hasPhone && hasEmail;

    // Trigger v3 API if:
    // 1. Response has incomplete data (!hasAllFields)
    // 2. OR URL contains invalid/placeholder parameters (hasInvalidParams)
    // 3. OR geolocation is enabled with address but data is still missing (hasGeolocationAddress && !hasAllFields)
    if (!hasAllFields || hasInvalidParams || (hasGeolocationAddress && !hasAllFields)) {
      // Keep original _index
      const originalIndex = data?.data?.[0]?._index;

      // Extract parameters for v3 API call (urlParams already parsed above)
      // Use geolocation address if params are empty/invalid and geolocation is available
      let address = window?.addressVal || urlParams.get('address') || '';
      if ((!address || !isValidParam(address)) && hasGeolocationAddress) {
        address = geoData.geolocation_address;
      }

      const name = urlParams.get('name') || source.name || '';
      const phone = urlParams.get('phone') || source.phone || '';
      const email = urlParams.get('email') || source.email || '';

      // Only call v3 API if we have at least one valid search parameter
      // The API requires at least one of: address, name, phone, email
      const hasValidParams = isValidParam(address) || isValidParam(name) ||
                            isValidParam(phone) || isValidParam(email);

      if (hasValidParams) {
        try {
          const partialMatchData = await callPartialMatchApi({
            address: address,
            name: name,
            phone: phone,
            email: email,
          });

          console.log('🔍 v3 API Response:', partialMatchData);

          // Merge data, preferring partial match API results
          if (partialMatchData?.data?.[0]) {
            const partialSource = partialMatchData.data[0]._source || {};
            console.log('✅ v3 API _source data:', partialSource);

            // Update _source with merged data
            data.data[0] = data.data[0] || {};
            data.data[0]._source = {
              name: partialSource.name || source.name,
              phone: partialSource.phone || source.phone,
              email: partialSource.email || source.email,
              // Add address fields from v3 response for prefilling
              address: partialSource.address || source.address || '',
              street: partialSource.street || source.street || '',
              city: partialSource.city || source.city || '',
              state: partialSource.state || source.state || '',
              zip: partialSource.zip || source.zip || '',
            };

            // IMPORTANT: Keep the original _index (don't replace with partial match _index)
            if (originalIndex) {
              data.data[0]._index = originalIndex;
            }

            // Update identity response
            window.identityResp = data.data[0];
            data.identity_api_res = window.identityResp;

            // Update identity checkout category based on merged data
            const updatedSource = data.data[0]._source;
            data.identity_checkout_category =
              (updatedSource.name && updatedSource.email && updatedSource.phone)
                ? "all_data_present"
                : "partial_data_present";

            // Update identity_api_source if not set
            if (!data.identity_api_source && data.data[0]._index) {
              const indexName = data.data[0]._index;
              data.identity_api_source = indexName === "data_axle" ? "address_dataaxle" : "address_internal";
            }
          }
        } catch (partialError) {
          // Continue with original data if partial match fails
        }
      }
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate address search by sending address data to backend
 * @param {Object} addressData - The address data from geocoder
 * @param {Object} originalParams - Original URL parameters before user interaction
 * @returns {Promise<Object>} Response from the API including redirect URL
 */
export const validateAddressSearch = async (addressData, originalParams = {}) => {
  try {
    // Extract address components from geocoder result
    const context = addressData.context || [];
    const addressText = addressData.text || '';
    const placeName = addressData.place_name || '';

    // Parse city, state, zip from context
    let city = '';
    let state = '';
    let zip = '';

    context.forEach(item => {
      if (item.id.includes('place')) {
        city = item.text;
      } else if (item.id.includes('region')) {
        state = item.short_code?.replace('US-', '') || item.text;
      } else if (item.id.includes('postcode')) {
        zip = item.text;
      }
    });

    // Check if user changed the prepopulated address
    const userChangedAddress = originalParams.street && (
      originalParams.street !== addressText ||
      originalParams.city !== city ||
      originalParams.state !== state ||
      originalParams.zip !== zip
    );

    // Build redirect address - use new address if user changed, otherwise use original
    let redirectAddress;
    if (userChangedAddress) {
      // User changed the address, use the new one
      redirectAddress = placeName;
    } else if (originalParams.street) {
      // User didn't change prepopulated address, use original URL format
      const origParts = [
        originalParams.street,
        originalParams.city,
        originalParams.state,
        originalParams.zip
      ].filter(Boolean);
      redirectAddress = origParts.join(', ');
    } else {
      // No original params, use the new address
      redirectAddress = placeName;
    }

    // Build redirect URL
    const timestamp = Date.now();
    const encodedAddress = encodeURIComponent(redirectAddress);
    const redirectUrl = `https://www.homelight.com/simple-sale/quiz?interested_in_agent=true?&address=${encodedAddress}&timestamp=${timestamp}#/qaas=0/`;

    // Preserve existing URL parameters and add/override with address parameters
    const existingParams = new URLSearchParams(window.location.search);

    // Add or update address-related parameters
    existingParams.set('street', addressText);
    existingParams.set('city', city);
    existingParams.set('state', state);
    existingParams.set('zip', zip);
    existingParams.set('address_chosen', 'dropdown');
    existingParams.set('prepop_address', placeName);

    // Build full URL with origin, pathname, and all query parameters
    const fullUrl = `${window.location.origin}${window.location.pathname}?${existingParams.toString()}`;

    const response = await fetch(`${API_BASE_URL}/checkout/prepop/v2/validate/landing-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: fullUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Return both API response and redirect URL
    return {
      ...data,
      redirectUrl
    };
  } catch (error) {
    throw error;
  }
};
