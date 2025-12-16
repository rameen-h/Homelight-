import { useEffect } from 'react';
import { sendSegmentPageEvent } from '../utils/analytics';

/**
 * Custom hook to send page view on component mount
 * Usage: useAnalytics() in your component
 */
export const useAnalytics = (sessionId = '', status = '', errorMessage = '', apiHitStatus = false) => {
  useEffect(() => {
    // Send page view when component mounts
    sendSegmentPageEvent(sessionId, status, errorMessage, apiHitStatus);
  }, [sessionId, status, errorMessage, apiHitStatus]);
};

export default useAnalytics;
