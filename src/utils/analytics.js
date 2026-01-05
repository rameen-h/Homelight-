/**
 * Analytics utility functions for Segment tracking
 * Matches manager's specified structure
 */

/**
 * Wait for Segment analytics to load before executing callback
 */
export const waitForAnalytics = (callback, retry = 0) => {
  if (typeof window.analytics !== 'undefined' && typeof window.analytics.track === 'function') {
    callback();
  } else if (retry < 10) {
    setTimeout(() => waitForAnalytics(callback, retry + 1), 100);
  } else {
    console.warn('Segment analytics not loaded after retries');
  }
};


/**
 * Build page data object matching manager's exact structure
 */
export const buildPageData = (sessionId = '', invalidFields = [], validatedUrl = '', geolocationData = null, additionalData = {}) => {
  const currentUrl = window.location.href;
  const parser = new URL(currentUrl);
  const searchParams = parser.searchParams;

  // Get session ID from parameter, sessionStorage, or window
  const finalSessionId = sessionId ||
                         sessionStorage.getItem('alysonSessionId') ||
                         window.alysonSessionId ||
                         searchParams.get("sessionId") ||
                         '';

  // Get geolocation data from parameter or window global state
  // Default to window.geolocationData which is set by App.js based on actual permission state
  const geoData = geolocationData || window.geolocationData || null;

  // If no geolocation data available, use defaults
  const finalGeoData = geoData ? geoData : {
    geolocation_address: '',
    geolocation_lat: '',
    geolocation_long: '',
    geolocation_permission: 'user_disabled',
    geolocation_triggered: 'no'
  };

  // Build URL without parameters
  const urlWithoutParam = `${parser.protocol}//${parser.host}${parser.pathname}`;

  return {
    // Page metadata
    title: document.title || 'Sell your house fast with Trusted Home Reports',
    domain: `${parser.protocol}//${parser.host}`,
    url: currentUrl,
    path: parser.pathname,
    url_without_param: urlWithoutParam,
    userAgent: navigator.userAgent,
    locale: navigator.language || 'en-US',
    search: parser.search,
    referrer: document.referrer || '',

    // Session tracking
    sessionId: finalSessionId,
    affid: searchParams.get("affid") || '',
    userId: '',

    // UTM Parameters
    utmSource: searchParams.get("utm_source") || '',
    utmMedium: searchParams.get("utm_medium") || '',
    utmCampaign: searchParams.get("utm_campaign") || '',
    utmTerm: searchParams.get("utm_term") || '',
    utmContent: searchParams.get("utm_content") || '',
    tuneId: searchParams.get("tuneId") || '',
    fbclid: searchParams.get("fbclid") || '',
    gclid: searchParams.get("gclid") || '',

    // Additional tracking parameters
    experiment_id: searchParams.get("eid") || '',
    d: searchParams.get("d") || '',
    checkoutId: searchParams.get("checkoutId") || '',

    // Prepopulated fields (from URL params - RAW values, not validated)
    prepop_email: searchParams.get("email") || '',
    prepop_phone: searchParams.get("phone") || '',
    prepop_name: searchParams.get("name") || '',
    prepop_address: searchParams.get("address") || '',
    prepop_street: searchParams.get("street") || '',
    prepop_city: searchParams.get("city") || '',
    prepop_state: searchParams.get("state") || '',
    prepop_zip: searchParams.get("zip") || '',
    prepop_fname: searchParams.get("fname") || '',
    prepop_lname: searchParams.get("lname") || '',

    // Quiz fields (empty initially, filled when user submits)
    quiz_address: '',
    quiz_name: '',
    quiz_email: '',
    quiz_phone: '',
    quiz_firstname: '',
    quiz_lastname: '',

    // Geolocation fields
    geolocation_address: finalGeoData.geolocation_address || '',
    geolocation_lat: finalGeoData.geolocation_lat || '',
    geolocation_long: finalGeoData.geolocation_long || '',
    geolocation_permission: finalGeoData.geolocation_permission || 'user_disabled',
    geolocation_triggered: finalGeoData.geolocation_triggered || 'no',

    // Status flags
    address_chosen: 'no',

    // Invalid fields tracking
    invalid_fields: invalidFields,
    validated_url: validatedUrl || currentUrl,

    // Identity API fields (populated from v3 API response)
    ip: '',
    identity_api_source: '',
    identity_api_res: null,
    identity_checkout_category: '',

    // Merge any additional data passed in
    ...additionalData
  };
};

/**
 * Send Segment page view event
 * Page name: "Trusted Home Offers" (as per manager's spec)
 */
export const sendSegmentPageEvent = (sessionId = '', invalidFields = [], validatedUrl = '', geolocationData = null, additionalData = {}) => {
  const pageData = buildPageData(sessionId, invalidFields, validatedUrl, geolocationData, {
    entry: true, // First page load
    category: window.location.href,
    name: 'Trusted Home Reports',
    ...additionalData
  });

  console.log('🔵 Tracking Page View:', pageData);

  waitForAnalytics(() => {
    window.analytics.page(window.location.href, "Trusted Home Reports", pageData);
    console.log('✅ Page View Sent to Segment');
  });
};

/**
 * Track custom events (button clicks, form submissions, etc.)
 */
export const trackEvent = (eventName, additionalData = {}) => {
  const pageData = buildPageData();
  const eventData = { ...pageData, ...additionalData };

  console.log('🔵 Tracking Event:', eventName, eventData);

  waitForAnalytics(() => {
    window.analytics.track(eventName, eventData);
    console.log('✅ Event Sent to Segment:', eventName);
  });
};

/**
 * Track button click events
 */
export const trackButtonClick = (buttonText, additionalData = {}) => {
  trackEvent('button_click', {
    button_text: buttonText,
    ...additionalData
  });
};
