/**
 * HomeLight Form Auto-Fill Script
 * This script decodes Base64-encoded URL parameters and auto-fills the HomeLight form
 *
 * Usage: Include this script on the HomeLight quiz page, or inject via browser extension
 */

(function() {
  'use strict';

  console.log('🔍 HomeLight Auto-Fill Script Loaded');

  // Function to decode Base64 parameter
  function decodeParam(encoded) {
    try {
      return atob(encoded);
    } catch (e) {
      console.error('Failed to decode parameter:', e);
      return null;
    }
  }

  // Get URL parameters
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      address: params.get('address') || null, // Address is NOT encoded
      name: params.get('n') ? decodeParam(params.get('n')) : null, // Name IS encoded
      email: params.get('e') ? decodeParam(params.get('e')) : null, // Email IS encoded
      phone: params.get('p') ? decodeParam(params.get('p')) : null, // Phone IS encoded
    };
  }

  // Check sessionStorage for prefill data
  function getSessionData() {
    try {
      const data = sessionStorage.getItem('hl_prefill_data');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to parse session data:', e);
      return null;
    }
  }

  // Fill form field
  function fillField(selector, value) {
    if (!value) return false;

    const field = document.querySelector(selector);
    if (field) {
      field.value = value;

      // Trigger input events to notify React/Angular frameworks
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });
      field.dispatchEvent(inputEvent);
      field.dispatchEvent(changeEvent);

      console.log(`✅ Filled field ${selector} with:`, value);
      return true;
    }
    return false;
  }

  // Try multiple common selectors for each field
  function fillFieldWithFallbacks(selectors, value) {
    if (!value) return;

    for (const selector of selectors) {
      if (fillField(selector, value)) {
        return; // Success, exit
      }
    }

    console.warn(`⚠️ Could not find field for value:`, value);
  }

  // Main auto-fill function
  function autoFillForm() {
    console.log('🚀 Starting auto-fill process...');

    // Get data from URL params or sessionStorage
    const urlData = getUrlParams();
    const sessionData = getSessionData();
    const data = { ...sessionData, ...urlData }; // URL params take precedence

    console.log('📋 Data to fill:', data);

    // Wait for DOM to be ready
    const fillInterval = setInterval(() => {
      // Common form field selectors for HomeLight
      const addressSelectors = [
        'input[name="address"]',
        'input[placeholder*="address" i]',
        'input[id*="address" i]',
        'input[type="text"]', // Fallback to first text input
      ];

      const nameSelectors = [
        'input[name="name"]',
        'input[name="firstName"]',
        'input[name="fullName"]',
        'input[placeholder*="name" i]',
        'input[id*="name" i]',
      ];

      const emailSelectors = [
        'input[name="email"]',
        'input[type="email"]',
        'input[placeholder*="email" i]',
        'input[id*="email" i]',
      ];

      const phoneSelectors = [
        'input[name="phone"]',
        'input[name="phoneNumber"]',
        'input[type="tel"]',
        'input[placeholder*="phone" i]',
        'input[id*="phone" i]',
      ];

      // Check if any field exists (form is loaded)
      const formExists = document.querySelector(addressSelectors.join(',')) ||
                        document.querySelector(nameSelectors.join(',')) ||
                        document.querySelector(emailSelectors.join(',')) ||
                        document.querySelector(phoneSelectors.join(','));

      if (formExists) {
        console.log('✅ Form detected, filling fields...');

        // Fill fields
        fillFieldWithFallbacks(addressSelectors, data.address);
        fillFieldWithFallbacks(nameSelectors, data.name);
        fillFieldWithFallbacks(emailSelectors, data.email);
        fillFieldWithFallbacks(phoneSelectors, data.phone);

        // Clear interval after successful fill
        clearInterval(fillInterval);
        console.log('✅ Auto-fill complete!');

        // Clear sessionStorage after use
        sessionStorage.removeItem('hl_prefill_data');
      }
    }, 500); // Check every 500ms

    // Stop trying after 10 seconds
    setTimeout(() => {
      clearInterval(fillInterval);
      console.log('⏱️ Auto-fill timeout - form not detected');
    }, 10000);
  }

  // Run auto-fill when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoFillForm);
  } else {
    autoFillForm();
  }

  // Also try on page load (for React apps that render after DOMContentLoaded)
  window.addEventListener('load', () => {
    setTimeout(autoFillForm, 1000);
  });

})();
