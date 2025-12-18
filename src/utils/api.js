/**
 * API utility functions for HomeLight application
 */

const API_BASE_URL = 'https://api.palisade.ai';

/**
 * Validate landing page by sending URL parameters to backend
 * @param {string} currentUrl - The current page URL with query parameters
 * @returns {Promise<Object>} Response from the API
 */
export const validateLandingPage = async (currentUrl) => {
  try {
    // Use current URL with all query parameters
    const urlToSend = currentUrl || window.location.href;

    console.log('🌐 Environment:', process.env.NODE_ENV);
    console.log('📤 API Call - validateLandingPage');
    console.log('📍 Full URL being sent:', urlToSend);
    console.log('📦 Request body:', JSON.stringify({ url: urlToSend }, null, 2));

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
    console.log('📥 API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error validating landing page:', error);
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
      console.log('✏️ User changed address - using new address for redirect');
    } else if (originalParams.street) {
      // User didn't change prepopulated address, use original URL format
      const origParts = [
        originalParams.street,
        originalParams.city,
        originalParams.state,
        originalParams.zip
      ].filter(Boolean);
      redirectAddress = origParts.join(', ');
      console.log('📌 User kept prepopulated address - using original URL params');
    } else {
      // No original params, use the new address
      redirectAddress = placeName;
      console.log('🆕 New address entry - using selected address');
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

    console.log('🏠 API Call - validateAddressSearch');
    console.log('📍 Address selected:', placeName);
    console.log('📦 Parsed components:', { street: addressText, city, state, zip });
    console.log('🔗 Redirect URL:', redirectUrl);
    console.log('📍 Full URL being sent:', fullUrl);
    console.log('📦 Request body:', JSON.stringify({ url: fullUrl }, null, 2));

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
    console.log('📥 API Response:', data);

    // Return both API response and redirect URL
    return {
      ...data,
      redirectUrl
    };
  } catch (error) {
    console.error('❌ Error validating address search:', error);
    throw error;
  }
};
