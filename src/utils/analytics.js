/**
 * Analytics utility functions for Segment tracking
 * Mirrors SimpleSale property names and structure
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
 * Build page data object with SimpleSale property names
 * This matches the exact structure from SimpleSale for consistency
 */
export const buildPageData = (sessionId = '', status = '', errorMessage = '', apiHitStatus = false) => {
  const parser = new URL(window.location.href);
  const searchParams = parser.searchParams;

  return {
    // Platform identifier
    source_platform: 'homelight',

    // Session tracking
    sessionId: sessionId || '',
    checkoutId: searchParams.get("checkoutId") || "28",
    utmContent: searchParams.get("utm_content") || sessionId || '',
    experiment_id: searchParams.get("eid") || '28',

    // UTM Parameters (camelCase to match SimpleSale exactly)
    utmSource: searchParams.get("utm_source") || '',
    utmMedium: searchParams.get("utm_medium") || '',
    utmCampaign: searchParams.get("utm_campaign") || '',
    utmTerm: searchParams.get("utm_term") || '',

    // Prepopulated fields (exact SimpleSale naming)
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

    // Status flags
    address_chosen: 'no',
    session_api_called: apiHitStatus,
    session_api_status: status,
    session_api_errorMessage: errorMessage,
  };
};

/**
 * Send Segment page view event
 * Page name: "Simple Sale Cash Offer" (matches SimpleSale)
 */
export const sendSegmentPageEvent = (sessionId = '', status = '', errorMessage = '', apiHitStatus = false) => {
  const pageData = buildPageData(sessionId, status, errorMessage, apiHitStatus);

  console.log('🔵 Tracking Page View:', pageData);

  waitForAnalytics(() => {
    window.analytics.page(window.location.href, "Simple Sale Cash Offer", pageData);
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

