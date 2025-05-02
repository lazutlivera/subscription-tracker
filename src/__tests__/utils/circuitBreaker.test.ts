import { canMakeRequest, recordFailure } from '@/utils/circuitBreaker';

jest.useFakeTimers();

describe('circuitBreaker', () => {
  beforeEach(() => {
    // Reset module state between tests
    jest.resetModules();
    jest.clearAllMocks();
    
    // Re-import to reset module state
    jest.isolateModules(() => {
      // Just importing to reset the module state
      require('@/utils/circuitBreaker');
    });
  });

  test('should allow requests initially', () => {
    expect(canMakeRequest()).toBe(true);
  });

  test('should continue to allow requests after fewer than MAX_FAILURES failures', () => {
    // Record 2 failures (MAX_FAILURES is 3)
    recordFailure();
    recordFailure();
    
    // Should still allow requests
    expect(canMakeRequest()).toBe(true);
  });

  test('should deny requests after MAX_FAILURES failures', () => {
    // Record 3 failures (MAX_FAILURES)
    recordFailure();
    recordFailure();
    recordFailure();
    
    // Should not allow requests
    expect(canMakeRequest()).toBe(false);
  });

  test('should allow requests again after reset timeout', () => {
    // Record enough failures to trip the circuit
    recordFailure();
    recordFailure();
    recordFailure();
    
    // Should not allow requests
    expect(canMakeRequest()).toBe(false);
    
    // Advance time past the reset timeout (60000ms = 1 minute)
    jest.advanceTimersByTime(61000);
    
    // Should allow requests again
    expect(canMakeRequest()).toBe(true);
  });

  test('should reset failure count after circuit resets', () => {
    // Record enough failures to trip the circuit
    recordFailure();
    recordFailure();
    recordFailure();
    
    // Advance time past the reset timeout
    jest.advanceTimersByTime(61000);
    
    // Should allow requests again
    expect(canMakeRequest()).toBe(true);
    
    // Should allow 2 more failures before tripping again
    recordFailure();
    recordFailure();
    expect(canMakeRequest()).toBe(true);
    
    // Third failure should trip the circuit again
    recordFailure();
    expect(canMakeRequest()).toBe(false);
  });
}); 