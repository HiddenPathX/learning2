/**
 * Utility functions for handling page visibility
 */

/**
 * Check if the page is currently visible
 * @returns {boolean} True if the page is visible, false otherwise
 */
export const isPageVisible = () => {
  return !document.hidden;
};

/**
 * Add a listener for page visibility changes
 * @param {Function} callback - Function to call when visibility changes
 * @returns {Function} Function to remove the listener
 */
export const addVisibilityListener = (callback) => {
  const handleVisibilityChange = () => {
    callback(!document.hidden);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', () => callback(false));
  window.addEventListener('focus', () => callback(true));

  // Return a cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', () => callback(false));
    window.removeEventListener('focus', () => callback(true));
  };
};

/**
 * Format seconds into hours, minutes, and seconds
 * @param {number} totalSeconds - Total seconds to format
 * @returns {Object} Object containing hours, minutes, and seconds
 */
export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  };
}; 