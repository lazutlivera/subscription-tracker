let failureCount = 0;
const MAX_FAILURES = 3;
let circuitOpen = false;
let lastFailureTime = 0;
const RESET_TIMEOUT = 60000; 

export function canMakeRequest(): boolean {
  if (circuitOpen) {
    const now = Date.now();
    if (now - lastFailureTime > RESET_TIMEOUT) {
      circuitOpen = false;
      failureCount = 0;
      return true;
    }
    return false;
  }
  return true;
}

export function recordFailure(): void {
  failureCount++;
  lastFailureTime = Date.now();
  if (failureCount >= MAX_FAILURES) {
    circuitOpen = true;
    console.error("Circuit breaker activated - stopping all API calls for 1 minute");
  }
} 