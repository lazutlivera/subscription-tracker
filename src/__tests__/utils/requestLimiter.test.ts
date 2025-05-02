import * as requestLimiter from '@/utils/requestLimiter';

jest.useFakeTimers();

describe('requestLimiter', () => {
  const testKey = 'test-key';
  
  beforeEach(() => {
    // Reset module state between tests
    jest.resetModules();
    jest.clearAllMocks();
    
    // Reset the request limiter module state for each test
    jest.isolateModules(() => {
      jest.requireActual('@/utils/requestLimiter');
    });
    
    // Clear any mock implementations
    jest.restoreAllMocks();
  });

  test('should allow first request', () => {
    // Create a new import for each test to ensure clean state
    jest.isolateModules(() => {
      const { canMakeRequest } = require('@/utils/requestLimiter');
      expect(canMakeRequest(testKey)).toBe(true);
    });
  });

  test('should not allow concurrent requests with same key', () => {
    jest.isolateModules(() => {
      const { canMakeRequest, finishRequest } = require('@/utils/requestLimiter');
      
      // First request should be allowed
      expect(canMakeRequest(testKey)).toBe(true);
      
      // Second request with same key should be denied
      expect(canMakeRequest(testKey)).toBe(false);
      
      // After finishing the request, new requests should be allowed
      finishRequest(testKey);
      
      // But not if the throttle time hasn't passed
      expect(canMakeRequest(testKey)).toBe(false);
    });
  });

  test('should allow request after throttle time passes', () => {
    jest.isolateModules(() => {
      const { canMakeRequest, finishRequest } = require('@/utils/requestLimiter');
      
      // First request
      expect(canMakeRequest(testKey)).toBe(true);
      finishRequest(testKey);
      
      // Advance time past the throttle interval (5000ms)
      jest.advanceTimersByTime(6000);
      
      // Now should allow the request
      expect(canMakeRequest(testKey)).toBe(true);
    });
  });

  test('should handle multiple keys independently', () => {
    jest.isolateModules(() => {
      const { canMakeRequest, finishRequest } = require('@/utils/requestLimiter');
      const key1 = 'key1';
      const key2 = 'key2';
      
      // Both keys should allow first request
      expect(canMakeRequest(key1)).toBe(true);
      expect(canMakeRequest(key2)).toBe(true);
      
      // Both keys should deny second concurrent request
      expect(canMakeRequest(key1)).toBe(false);
      expect(canMakeRequest(key2)).toBe(false);
      
      // Finish request for key1
      finishRequest(key1);
      
      // Advance time past throttle interval
      jest.advanceTimersByTime(6000);
      
      // key1 should allow requests after time passes and request is finished
      expect(canMakeRequest(key1)).toBe(true);
      
      // key2 is still in progress
      expect(canMakeRequest(key2)).toBe(false);
    });
  });
}); 