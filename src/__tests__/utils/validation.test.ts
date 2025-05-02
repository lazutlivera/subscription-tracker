import { validatePassword } from '@/utils/validation';

describe('validatePassword', () => {
  test('should return isValid=true for valid password', () => {
    const result = validatePassword('Password123');
    expect(result.isValid).toBe(true);
    expect(result.error).toBe('');
  });

  test('should return error if password is less than 8 characters', () => {
    const result = validatePassword('Pass1');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters long');
  });

  test('should return error if password has no uppercase letter', () => {
    const result = validatePassword('password123');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must contain at least one uppercase letter');
  });

  test('should return error if password has no lowercase letter', () => {
    const result = validatePassword('PASSWORD123');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must contain at least one lowercase letter');
  });

  test('should return error if password has no number', () => {
    const result = validatePassword('PasswordNoNumbers');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must contain at least one number');
  });
}); 