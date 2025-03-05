let requestsInProgress: Record<string, boolean> = {};
let lastRequestTime: Record<string, number> = {};
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between identical requests

export const canMakeRequest = (key: string): boolean => {
  const now = Date.now();
  
  // If a request with this key is already in progress, don't allow another
  if (requestsInProgress[key]) {
    return false;
  }
  
  // If we've made this request recently, don't allow another yet
  if (lastRequestTime[key] && now - lastRequestTime[key] < MIN_REQUEST_INTERVAL) {
    return false;
  }
  
  // Mark this request as in progress and update the last request time
  requestsInProgress[key] = true;
  lastRequestTime[key] = now;
  
  return true;
};

export const finishRequest = (key: string): void => {
  requestsInProgress[key] = false;
}; 