let requestsInProgress: Record<string, boolean> = {};
let lastRequestTime: Record<string, number> = {};
const MIN_REQUEST_INTERVAL = 5000; 

export const canMakeRequest = (key: string): boolean => {
  const now = Date.now();
  
  if (requestsInProgress[key]) {
    return false;
  }
  
  if (lastRequestTime[key] && now - lastRequestTime[key] < MIN_REQUEST_INTERVAL) {
    return false;
  }
  
  requestsInProgress[key] = true;
  lastRequestTime[key] = now;
  
  return true;
};

export const finishRequest = (key: string): void => {
  requestsInProgress[key] = false;
}; 